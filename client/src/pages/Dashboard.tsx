import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Upload,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Receipt } from '../types/receipt';
import { getReceipts } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReceipts();
      setReceipts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalReceipts: receipts.length,
    completedReceipts: receipts.filter(r => r.status === 'completed').length,
    processingReceipts: receipts.filter(r => r.status === 'processing').length,
    totalAmount: receipts
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalAmount, 0),
  };

  const recentReceipts = receipts
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5);

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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your receipt processing dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
          <Button onClick={fetchReceipts} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ReceiptIcon size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {stats.totalReceipts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Receipts
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <TrendingUp size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {stats.completedReceipts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <Clock size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {stats.processingReceipts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Processing
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <DollarSign size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        ${stats.totalAmount.toFixed(0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Quick Actions */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Quick Actions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Upload size={20} />}
                      onClick={() => navigate('/upload')}
                      sx={{ py: 1.5 }}
                    >
                      Upload New Receipt
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<ReceiptIcon size={20} />}
                      onClick={() => navigate('/receipts')}
                      sx={{ py: 1.5 }}
                    >
                      View All Receipts
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Receipts */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Receipts
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/receipts')}
                    >
                      View All
                    </Button>
                  </Box>

                  {recentReceipts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <ReceiptIcon size={48} style={{ color: '#ccc', marginBottom: 16 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No receipts yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload your first receipt to get started
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Upload size={18} />}
                        onClick={() => navigate('/upload')}
                      >
                        Upload Receipt
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {recentReceipts.map((receipt, index) => (
                        <Box key={receipt.id}>
                          <ListItem
                            alignItems="flex-start"
                            sx={{
                              cursor: 'pointer',
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                            onClick={() => navigate(`/receipts/${receipt.id}`)}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <ReceiptIcon size={20} />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {receipt.merchantName}
                                  </Typography>
                                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                                    ${receipt.totalAmount.toFixed(2)}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {format(new Date(receipt.uploadDate), 'MMM dd, yyyy')}
                                  </Typography>
                                  <Chip
                                    label={receipt.status}
                                    color={getStatusColor(receipt.status) as any}
                                    size="small"
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < recentReceipts.length - 1 && <Divider variant="inset" component="li" />}
                        </Box>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;