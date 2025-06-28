import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Receipt as ReceiptIcon,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import { Receipt } from '../types/receipt';
import { getReceiptById, reprocessReceipt } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ReceiptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessDialog, setReprocessDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReceipt(id);
    }
  }, [id]);

  const fetchReceipt = async (receiptId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReceiptById(receiptId);
      setReceipt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async () => {
    if (!receipt) return;

    try {
      setReprocessing(true);
      const updatedReceipt = await reprocessReceipt(receipt.id);
      setReceipt(updatedReceipt);
      setReprocessDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reprocess receipt');
    } finally {
      setReprocessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
        <Button onClick={() => id && fetchReceipt(id)} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!receipt) {
    return (
      <Alert severity="warning">
        Receipt not found
      </Alert>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/receipts')}
          sx={{ textDecoration: 'none' }}
        >
          Receipts
        </Link>
        <Typography variant="body2" color="text.primary">
          {receipt.merchantName}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/receipts')}
          sx={{ mr: 3 }}
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            {receipt.merchantName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={receipt.status}
              color={getStatusColor(receipt.status) as any}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Uploaded on {format(new Date(receipt.uploadDate), 'MMM dd, yyyy')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={18} />}
            onClick={() => setReprocessDialog(true)}
            disabled={receipt.status === 'processing'}
          >
            Reprocess
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download size={18} />}
            onClick={() => {
              // Handle PDF download
              console.log('Download PDF:', receipt.filename);
            }}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Receipt Summary */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Receipt Summary
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ReceiptIcon size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Merchant
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {receipt.merchantName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <Calendar size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Purchase Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {format(new Date(receipt.purchaseDate), 'MMMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <DollarSign size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                        ${receipt.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <FileText size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        File Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {receipt.filename}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {receipt.address && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Merchant Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {receipt.address && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <MapPin size={20} style={{ marginRight: 12, marginTop: 2, color: '#666' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Address
                            </Typography>
                            <Typography variant="body1">
                              {receipt.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {receipt.phoneNumber && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Phone size={20} style={{ marginRight: 12, color: '#666' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              {receipt.phoneNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {receipt.email && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Mail size={20} style={{ marginRight: 12, color: '#666' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {receipt.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          {receipt.items && receipt.items.length > 0 && (
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Items
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {receipt.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            ${item.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Receipt Totals */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Receipt Totals
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  ${(receipt.subtotal || receipt.totalAmount).toFixed(2)}
                </Typography>
              </Box>
              
              {receipt.taxAmount && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Tax</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ${receipt.taxAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  ${receipt.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reprocess Dialog */}
      <Dialog open={reprocessDialog} onClose={() => setReprocessDialog(false)}>
        <DialogTitle>Reprocess Receipt</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to reprocess this receipt? This will extract the information
            from the PDF file again and may overwrite existing data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReprocessDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReprocess}
            variant="contained"
            disabled={reprocessing}
          >
            {reprocessing ? 'Reprocessing...' : 'Reprocess'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceiptDetail;