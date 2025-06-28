import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadReceipt, validateReceipt, processReceipt } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface UploadState {
  file: File | null;
  fileId: number | null; // Changed from string to number
  uploading: boolean;
  validating: boolean;
  processing: boolean;
  uploadError: string | null;
  validationError: string | null;
  processError: string | null;
  uploadSuccess: boolean;
  validationSuccess: boolean;
  processSuccess: boolean;
}

const UploadReceipt: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<UploadState>({
    file: null,
    fileId: null,
    uploading: false,
    validating: false,
    processing: false,
    uploadError: null,
    validationError: null,
    processError: null,
    uploadSuccess: false,
    validationSuccess: false,
    processSuccess: false,
  });

  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      setState(prev => ({ ...prev, uploadError: 'Please select a PDF file only.' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setState(prev => ({ ...prev, uploadError: 'File size must be less than 10MB.' }));
      return;
    }

    setState(prev => ({
      ...prev,
      file,
      uploadError: null,
      validationError: null,
      processError: null,
      uploadSuccess: false,
      validationSuccess: false,
      processSuccess: false,
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!state.file) return;

    setState(prev => ({ ...prev, uploading: true, uploadError: null }));

    try {
      const response = await uploadReceipt(state.file);
      setState(prev => ({
        ...prev,
        uploading: false,
        uploadSuccess: true,
        fileId: response.fileId,
      }));

      // Auto-validate after successful upload
      handleValidate(response.fileId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        uploading: false,
        uploadError: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  };

  const handleValidate = async (fileId?: number) => {
    const id = fileId || state.fileId;
    if (!id) return;

    setState(prev => ({ ...prev, validating: true, validationError: null }));

    try {
      const response = await validateReceipt(id);
      if (response.isValid) {
        setState(prev => ({
          ...prev,
          validating: false,
          validationSuccess: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          validating: false,
          validationError: response.errors?.join(', ') || 'Validation failed',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        validating: false,
        validationError: error instanceof Error ? error.message : 'Validation failed',
      }));
    }
  };

  const handleProcess = async () => {
    if (!state.fileId) return;

    setState(prev => ({ ...prev, processing: true, processError: null }));

    try {
      const receipt = await processReceipt(state.fileId);
      setState(prev => ({
        ...prev,
        processing: false,
        processSuccess: true,
      }));

      // Navigate to receipt detail after successful processing
      setTimeout(() => {
        navigate(`/receipts/${receipt.id}`);
      }, 1500);
    } catch (error) {
      setState(prev => ({
        ...prev,
        processing: false,
        processError: error instanceof Error ? error.message : 'Processing failed',
      }));
    }
  };

  const resetUpload = () => {
    setState({
      file: null,
      fileId: null,
      uploading: false,
      validating: false,
      processing: false,
      uploadError: null,
      validationError: null,
      processError: null,
      uploadSuccess: false,
      validationSuccess: false,
      processSuccess: false,
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Upload Receipt
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload a PDF receipt to extract and process the information automatically.
      </Typography>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {!state.file ? (
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: 'primary.50',
                '&:hover': {
                  bgcolor: 'primary.100',
                },
              }}
            >
              <Upload size={48} style={{ marginBottom: 16, color: '#1976d2' }} />
              <Typography variant="h6" gutterBottom>
                Drag & drop your receipt here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or click to browse files
              </Typography>
              <Button
                variant="contained"
                component="label"
                sx={{ mt: 2 }}
              >
                Choose File
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={handleFileInput}
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                PDF files only, max 10MB
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FileText size={24} style={{ marginRight: 12 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {state.file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(state.file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
                <IconButton onClick={resetUpload} size="small">
                  <X size={20} />
                </IconButton>
              </Box>

              <Stack spacing={2}>
                {/* Upload Step */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={state.uploading || state.uploadSuccess}
                    sx={{ minWidth: 120 }}
                  >
                    {state.uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  {state.uploadSuccess && (
                    <Chip
                      icon={<CheckCircle size={16} />}
                      label="Uploaded"
                      color="success"
                      size="small"
                    />
                  )}
                  {state.uploadError && (
                    <Chip
                      icon={<AlertCircle size={16} />}
                      label="Failed"
                      color="error"
                      size="small"
                    />
                  )}
                </Box>

                {state.uploading && <LinearProgress />}

                {/* Validation Step */}
                {state.uploadSuccess && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleValidate()}
                      disabled={state.validating || state.validationSuccess}
                      sx={{ minWidth: 120 }}
                    >
                      {state.validating ? 'Validating...' : 'Validate'}
                    </Button>
                    {state.validationSuccess && (
                      <Chip
                        icon={<CheckCircle size={16} />}
                        label="Valid"
                        color="success"
                        size="small"
                      />
                    )}
                    {state.validationError && (
                      <Chip
                        icon={<AlertCircle size={16} />}
                        label="Invalid"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                )}

                {state.validating && <LinearProgress />}

                {/* Process Step */}
                {state.validationSuccess && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleProcess}
                      disabled={state.processing || state.processSuccess}
                      sx={{ minWidth: 120 }}
                    >
                      {state.processing ? 'Processing...' : 'Process Receipt'}
                    </Button>
                    {state.processSuccess && (
                      <Chip
                        icon={<CheckCircle size={16} />}
                        label="Processed"
                        color="success"
                        size="small"
                      />
                    )}
                    {state.processError && (
                      <Chip
                        icon={<AlertCircle size={16} />}
                        label="Failed"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                )}

                {state.processing && <LinearProgress />}

                {/* Error Messages */}
                {state.uploadError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {state.uploadError}
                  </Alert>
                )}
                {state.validationError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {state.validationError}
                  </Alert>
                )}
                {state.processError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {state.processError}
                  </Alert>
                )}

                {/* Success Message */}
                {state.processSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Receipt processed successfully! Redirecting to receipt details...
                  </Alert>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UploadReceipt;