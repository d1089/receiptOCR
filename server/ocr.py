from pdf2image import convert_from_path
from PIL import Image
import pytesseract
import os
import re

# Debugging flag (save intermediate images)
DEBUG_SAVE_IMAGES = True
OUTPUT_IMAGE_DIR = "output_pages"
if DEBUG_SAVE_IMAGES:
    os.makedirs(OUTPUT_IMAGE_DIR, exist_ok=True)

def extract_text_from_pdf(pdf_path: str) -> str:
    pages = convert_from_path(pdf_path, dpi=180)  # Lower DPI for speed
    all_text = []

    for idx, page in enumerate(pages):
        page = page.convert("RGB")

        # Save or use temp path
        if DEBUG_SAVE_IMAGES:
            img_path = os.path.join(OUTPUT_IMAGE_DIR, f"{os.path.basename(pdf_path)}_page{idx+1}.png")
            page.save(img_path)
        else:
            img_path = f"/tmp/temp_page_{idx+1}.png"
            page.save(img_path)

        # OCR using pytesseract
        text = pytesseract.image_to_string(page, lang='eng')
        print(text)
        all_text.append(text.strip())

        # Clean up temp image
        if not DEBUG_SAVE_IMAGES and os.path.exists(img_path):
            os.remove(img_path)

    return "\n".join(all_text)


def extract_fields_from_text(text: str) -> dict:
    result = {}

    # Clean and split text
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # 1. Merchant name: first line
    def is_mostly_numeric(text):
        return sum(c.isdigit() for c in text) >= len(text.strip()) * 0.7  # 70% or more digits

    merchant_name = "Unknown"
    for i in range(min(3, len(lines))):  # Check first 3 lines only
        line = lines[i]
        if line and not is_mostly_numeric(line):
            merchant_name = line.title()
            break

    result["merchant_name"] = merchant_name

    # 2. Purchase date and time
    def parse_datetime_from_text(text: str) -> str | None:
        patterns = [
            # 1. 17:52 05/20/24 or 17:52 5/20/24
            (r'(\d{1,2}:\d{2})\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2})', "%H:%M %m/%d/%y"),
            
            # 2. 5/25/24 11:31 AM or 05/25/24 9:00 AM
            (r'(\d{1,2}[/-]\d{1,2}[/-]\d{2})\s+(\d{1,2}:\d{2}\s?[APMapm]{2})', "%m/%d/%y %I:%M %p"),
            
            # 3. Date only: 05/24/24
            (r'(\d{1,2}[/-]\d{1,2}[/-]\d{2})', "%m/%d/%y"),
        ]

        for pattern, fmt in patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    dt_str = " ".join(match.groups())
                    dt_obj = datetime.strptime(dt_str.strip(), fmt)
                    return dt_obj.strftime("%Y-%m-%d %H:%M")
                except Exception:
                    continue
        return None

    result["purchased_at"] = parse_datetime_from_text(text)

    # 3. Total amount
    total_match = re.search(r'TOTAL[:\s]*\$?([\d]+\.\d{2})', text, re.IGNORECASE)
    if not total_match:
        all_amounts = re.findall(r'\$?([\d]+\.\d{2})', text)
        if all_amounts:
            result["total_amount"] = float(max(all_amounts, key=float))
        else:
            result["total_amount"] = None
    else:
        result["total_amount"] = float(total_match.group(1))

    return result