
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, Search, Trash2, Banknote, ArrowDownUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { format, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
export interface Expense {
  id: string;
  name: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
}

// Get all expenses
export const getAllExpenses = async (): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

// Add a new expense
export const addExpense = async (expense: Partial<Expense>): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        name: expense.name,
        amount: expense.amount,
        description: expense.description,
        date: expense.date
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};




const mapToExpenses = (data: any[]): any[] => {
  if (!Array.isArray(data)) {
    console.error('Expected array for expenses mapping, got:', data);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    amount: item.amount,
    description: item.description,
    date: item.date,
    created_at: item.created_at
  }));
};

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    name: '',
    amount: 0,
    description: '',
    date: new Date().toISOString(),
  });
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  const { toast } = useToast();
  const navigate = useNavigate();



  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const allExpenses = await getAllExpenses();
      // Map to properly typed expenses
      const typedExpenses = mapToExpenses(allExpenses);
      setExpenses(typedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.name) {
      toast({
        title: 'Missing fields',
        description: 'Please provide a name for the expense',
        variant: 'destructive',
      });
      return;
    }

    if (!newExpense.amount || newExpense.amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please provide a valid amount for the expense',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addExpense(newExpense);

      toast({
        title: 'Success',
        description: 'Expense added successfully',
      });

      setShowAddExpense(false);
      setNewExpense({
        name: '',
        amount: 0,
        description: '',
        date: new Date().toISOString(),
      });

      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);

      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });

      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    }
  };

  const handleDateChange = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (startDate || endDate) {
      const expenseDate = parseISO(expense.date);
      if (!isValid(expenseDate)) return false;

      if (startDate && expenseDate < startDate) return false;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (expenseDate > endOfDay) return false;
      }
    }

    return true;
  });

  const totalFilteredExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // For monthly grouping
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = parseISO(expense.date);
    if (!isValid(date)) return groups;

    const monthYear = format(date, 'MMMM yyyy');

    if (!groups[monthYear]) {
      groups[monthYear] = {
        expenses: [],
        total: 0
      };
    }

    groups[monthYear].expenses.push(expense);
    groups[monthYear].total += Number(expense.amount);

    return groups;
  }, {} as Record<string, { expenses: Expense[], total: number }>);

  return (

    <DashboardLayout role="admin">


      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  pb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage and track your business expenses
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button
                variant='secondary'
                onClick={() => setShowAddExpense(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4 text-white" />
                Add Expense
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Search Input */}
                  <div className="col-span-1 flex items-center relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 py-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm rounded-md w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Date Pickers */}
                  <div className="flex items-center justify-start space-x-2 flex-wrap">
                    <DatePicker date={startDate} setDate={(date) => handleDateChange(date, 'start')} />
                    <span className="text-gray-500 text-sm text-center w-full">to</span>
                    <DatePicker date={endDate} setDate={(date) => handleDateChange(date, 'end')} />
                  </div>

                  {/* View Mode Buttons */}
                  <div className="flex space-x-2 flex-wrap">
                    <Button
                      variant={viewMode === 'daily' ? 'default' : 'outline'}
                      onClick={() => setViewMode('daily')}
                      className={`py-1.5 text-xs font-semibold flex-1 ${viewMode === 'daily' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-blue-600'
                        }`}
                    >
                      Daily
                    </Button>
                    <Button
                      variant={viewMode === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setViewMode('monthly')}
                      className={`py-1.5 text-xs font-semibold flex-1 ${viewMode === 'monthly' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-blue-600'
                        }`}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>

              </div>


              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading expenses...</p>
                </div>
              ) : (
                <>
                  {viewMode === 'daily' ? (
                    <div className="overflow-x-scroll ">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Amount</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="w-20 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExpenses.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No expenses found for the selected period
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredExpenses.map((expense) => (
                              <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <TableCell className="font-medium">{expense.name}</TableCell>
                                <TableCell className="text-blue-600 dark:text-blue-400 font-medium">${parseFloat(expense.amount as any).toLocaleString()}</TableCell>
                                <TableCell>
                                  {isValid(parseISO(expense.date)) ?
                                    format(parseISO(expense.date), 'dd MMM yyyy') :
                                    'Invalid date'}
                                </TableCell>
                                <TableCell className="text-gray-600 dark:text-gray-400">{expense.description || '-'}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    className="hover:bg-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="space-y-6 p-4">
                      {Object.keys(groupedExpenses).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No expenses found for the selected period
                        </div>
                      ) : (
                        Object.entries(groupedExpenses).map(([month, data]) => (
                          <div key={month} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 flex justify-between items-center">
                              <h3 className="font-medium text-lg">{month}</h3>
                              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                <Banknote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold text-blue-600 dark:text-blue-400">${data.total.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                                    <TableHead className="font-semibold">Name</TableHead>
                                    <TableHead className="font-semibold">Amount</TableHead>
                                    <TableHead className="font-semibold">Date</TableHead>
                                    <TableHead className="font-semibold">Description</TableHead>
                                    <TableHead className="w-20 text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {data.expenses.map((expense) => (
                                    <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                      <TableCell className="font-medium">{expense.name}</TableCell>
                                      <TableCell className="text-blue-600 dark:text-blue-400 font-medium">${parseFloat(expense.amount as any).toLocaleString()}</TableCell>
                                      <TableCell>
                                        {isValid(parseISO(expense.date)) ?
                                          format(parseISO(expense.date), 'dd MMM yyyy') :
                                          'Invalid date'}
                                      </TableCell>
                                      <TableCell className="text-gray-600 dark:text-gray-400">{expense.description || '-'}</TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => handleDeleteExpense(expense.id)}
                                          className="hover:bg-red-600"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} found
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Total:</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${totalFilteredExpenses.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Add Expense Dialog */}
        <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details of the expense you want to add.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Expense Name</Label>
                <Input
                  id="name"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  placeholder="Rent, Utilities, Materials, etc."
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                  placeholder="Enter amount"
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  date={newExpense.date ? parseISO(newExpense.date) : undefined}
                  setDate={(date) => setNewExpense({ ...newExpense, date: date ? date.toISOString() : new Date().toISOString() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newExpense.description || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Add additional details"
                  rows={3}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddExpense(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense} className="bg-blue-600 hover:bg-blue-700">
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </DashboardLayout>
  );
};

export default Expenses;
