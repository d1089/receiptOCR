import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
} from '@mui/material';
import { Search, Eye, Filter, Receipt as ReceiptIcon, Calendar, DollarSign, MoreVertical as MoreVert } from 'lucide-react';
import { Receipt } from '../types/receipt';
import { getReceipts } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ReceiptsList: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    filterReceipts();
  }, [receipts, searchQuery, statusFilter]);

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

  const filterReceipts = () => {
    let filtered = receipts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(receipt =>
        receipt.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(receipt => receipt.status === statusFilter);
    }

    setFilteredReceipts(filtered);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⏳';
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    handleFilterClose();
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
        <Button onClick={fetchReceipts} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Receipts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredReceipts.length} receipts found
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/upload')}
          sx={{ minWidth: 140 }}
        >
          Upload Receipt
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          placeholder="Search receipts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="outlined"
          onClick={handleFilterClick}
          startIcon={<Filter size={18} />}
          sx={{ minWidth: 120 }}
        >
          {statusFilter === 'all' ? 'All Status' : statusFilter}
        </Button>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleStatusFilterChange('all')}>All Status</MenuItem>
          <MenuItem onClick={() => handleStatusFilterChange('completed')}>Completed</MenuItem>
          <MenuItem onClick={() => handleStatusFilterChange('processing')}>Processing</MenuItem>
          <MenuItem onClick={() => handleStatusFilterChange('failed')}>Failed</MenuItem>
        </Menu>
      </Box>

      {filteredReceipts.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <ReceiptIcon size={64} style={{ color: '#ccc', marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No receipts found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first receipt to get started'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/upload')}
            >
              Upload Receipt
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {filteredReceipts.map((receipt) => (
            <Grid item xs={12} sm={6} md={4} key={receipt.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/receipts/${receipt.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ReceiptIcon size={20} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {receipt.merchantName}
                      </Typography>
                      <Chip
                        label={getStatusIcon(receipt.status) + ' ' + receipt.status}
                        color={getStatusColor(receipt.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Calendar size={16} style={{ marginRight: 8, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(receipt.purchaseDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DollarSign size={16} style={{ marginRight: 8, color: '#666' }} />
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      ${receipt.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Eye size={16} />}
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/receipts/${receipt.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Merchant</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                        <ReceiptIcon size={16} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {receipt.merchantName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {receipt.filename}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {format(new Date(receipt.purchaseDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${receipt.totalAmount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={receipt.status}
                      color={getStatusColor(receipt.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Eye size={16} />}
                      onClick={() => navigate(`/receipts/${receipt.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ReceiptsList;