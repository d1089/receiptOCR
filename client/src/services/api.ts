import axios from 'axios';
import { Receipt, ApiResponse, UploadResponse, ValidationResponse } from '../types/receipt';

const API_BASE_URL = 'http://localhost:8000'; // Updated to match FastAPI default port

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use((config) => {
  // Add auth token if available
  // config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle FastAPI validation errors
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.detail || [];
      const errorMessages = validationErrors.map((err: any) => 
        `${err.loc?.join('.')}: ${err.msg}`
      ).join(', ');
      throw new Error(errorMessages || 'Validation error');
    }
    
    // Handle other HTTP errors
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    throw new Error(error.message || 'An unexpected error occurred');
  }
);

export const uploadReceipt = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Assuming the API returns { file_id: number, filename: string }
  return {
    fileId: response.data.file_id,
    filename: response.data.filename || file.name,
  };
};

export const validateReceipt = async (fileId: number): Promise<ValidationResponse> => {
  const response = await api.post('/validate', null, {
    params: { file_id: fileId }
  });

  // Assuming the API returns validation status
  return {
    isValid: response.data.is_valid || response.data.valid || true,
    errors: response.data.errors || [],
  };
};

export const processReceipt = async (fileId: number): Promise<Receipt> => {
  const response = await api.post('/process', null, {
    params: { file_id: fileId }
  });

  // Transform the response to match our Receipt interface
  const receiptData = response.data;
  
  return {
    id: receiptData.id?.toString() || fileId.toString(),
    merchantName: receiptData.merchant_name || receiptData.merchantName || 'Unknown Merchant',
    purchaseDate: receiptData.purchase_date || receiptData.purchaseDate || new Date().toISOString(),
    totalAmount: parseFloat(receiptData.total_amount || receiptData.totalAmount || '0'),
    status: receiptData.status || 'completed',
    filename: receiptData.filename || 'receipt.pdf',
    uploadDate: receiptData.upload_date || receiptData.uploadDate || new Date().toISOString(),
    items: receiptData.items?.map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(),
      name: item.name || item.description || 'Unknown Item',
      quantity: parseInt(item.quantity || '1'),
      price: parseFloat(item.price || item.unit_price || '0'),
      total: parseFloat(item.total || item.line_total || '0'),
    })) || [],
    address: receiptData.address || receiptData.merchant_address,
    phoneNumber: receiptData.phone_number || receiptData.phone,
    email: receiptData.email,
    taxAmount: parseFloat(receiptData.tax_amount || receiptData.tax || '0'),
    subtotal: parseFloat(receiptData.subtotal || receiptData.sub_total || '0'),
  };
};

export const getReceipts = async (): Promise<Receipt[]> => {
  const response = await api.get('/receipts');

  // Transform array response to match our Receipt interface
  const receipts = Array.isArray(response.data) ? response.data : response.data.receipts || [];
  
  return receipts.map((receiptData: any) => ({
    id: receiptData.id?.toString() || Math.random().toString(),
    merchantName: receiptData.merchant_name || receiptData.merchantName || 'Unknown Merchant',
    purchaseDate: receiptData.purchase_date || receiptData.purchaseDate || new Date().toISOString(),
    totalAmount: parseFloat(receiptData.total_amount || receiptData.totalAmount || '0'),
    status: receiptData.status || 'completed',
    filename: receiptData.filename || 'receipt.pdf',
    uploadDate: receiptData.upload_date || receiptData.uploadDate || new Date().toISOString(),
    items: receiptData.items?.map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(),
      name: item.name || item.description || 'Unknown Item',
      quantity: parseInt(item.quantity || '1'),
      price: parseFloat(item.price || item.unit_price || '0'),
      total: parseFloat(item.total || item.line_total || '0'),
    })) || [],
    address: receiptData.address || receiptData.merchant_address,
    phoneNumber: receiptData.phone_number || receiptData.phone,
    email: receiptData.email,
    taxAmount: parseFloat(receiptData.tax_amount || receiptData.tax || '0'),
    subtotal: parseFloat(receiptData.subtotal || receiptData.sub_total || '0'),
  }));
};

export const getReceiptById = async (id: string): Promise<Receipt> => {
  const response = await api.get(`/receipts/${id}`);

  // Transform the response to match our Receipt interface
  const receiptData = response.data;
  
  return {
    id: receiptData.id?.toString() || id,
    merchantName: receiptData.merchant_name || receiptData.merchantName || 'Unknown Merchant',
    purchaseDate: receiptData.purchase_date || receiptData.purchaseDate || new Date().toISOString(),
    totalAmount: parseFloat(receiptData.total_amount || receiptData.totalAmount || '0'),
    status: receiptData.status || 'completed',
    filename: receiptData.filename || 'receipt.pdf',
    uploadDate: receiptData.upload_date || receiptData.uploadDate || new Date().toISOString(),
    items: receiptData.items?.map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(),
      name: item.name || item.description || 'Unknown Item',
      quantity: parseInt(item.quantity || '1'),
      price: parseFloat(item.price || item.unit_price || '0'),
      total: parseFloat(item.total || item.line_total || '0'),
    })) || [],
    address: receiptData.address || receiptData.merchant_address,
    phoneNumber: receiptData.phone_number || receiptData.phone,
    email: receiptData.email,
    taxAmount: parseFloat(receiptData.tax_amount || receiptData.tax || '0'),
    subtotal: parseFloat(receiptData.subtotal || receiptData.sub_total || '0'),
  };
};

export const reprocessReceipt = async (id: string): Promise<Receipt> => {
  // Since there's no reprocess endpoint in the schema, we'll use the process endpoint
  // This assumes the backend can handle reprocessing by calling process with the same file_id
  const fileId = parseInt(id);
  return await processReceipt(fileId);
};