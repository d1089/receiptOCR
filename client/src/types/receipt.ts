export interface Receipt {
  id: string;
  merchantName: string;
  purchaseDate: string;
  totalAmount: number;
  status: 'processing' | 'completed' | 'failed';
  filename: string;
  uploadDate: string;
  items?: ReceiptItem[];
  address?: string;
  phoneNumber?: string;
  email?: string;
  taxAmount?: number;
  subtotal?: number;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UploadResponse {
  fileId: number; // Changed from string to number to match API schema
  filename: string;
}

export interface ValidationResponse {
  isValid: boolean;
  errors?: string[];
}