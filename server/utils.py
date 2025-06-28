import fitz

def is_valid_pdf(file_path: str) -> (bool, str):
    try:
        doc = fitz.open(file_path)
        doc.close()
        return True, None
    except Exception as e:
        return False, str(e)