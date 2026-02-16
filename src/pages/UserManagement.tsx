import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Settings2, Loader2, PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { UserAPI } from '../api/userApi';
import { FieldStore } from '../types/fieldstore';
import { FieldConfig, FieldType, User } from '../types/fields';
import { useToast } from '../hooks/use-toast';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [globalFields, setGlobalFields] = useState<FieldConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [userCustomFields, setUserCustomFields] = useState<FieldConfig[]>([]);
  const [newCustomField, setNewCustomField] = useState<Partial<FieldConfig>>({
    type: 'text',
    required: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [loadedUsers, loadedFields] = await Promise.all([
        UserAPI.getAll(),
        FieldStore.getFields(),
      ]);
      console.log('📊 Loaded users:', loadedUsers.length);
      console.log('📋 Loaded fields:', loadedFields.length, loadedFields);
      setUsers(loadedUsers);
      setGlobalFields(loadedFields);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get all fields for a user (global + user-specific)
  const getAllFieldsForUser = (user?: User): FieldConfig[] => {
    const customFields = user?.customFields || userCustomFields;
    return [...globalFields, ...customFields];
  };

  // Get all unique field names across all users (for table headers)
  const getAllUniqueFields = (): FieldConfig[] => {
    const fieldMap = new Map<string, FieldConfig>();
    
    // Add global fields
    globalFields.forEach(field => {
      fieldMap.set(field.name, field);
    });

    // Add custom fields from all users
    users.forEach(user => {
      if (user.customFields) {
        user.customFields.forEach((field:any) => {
          if (!fieldMap.has(field.name)) {
            fieldMap.set(field.name, field);
          }
        });
      }
    });

    return Array.from(fieldMap.values());
  };

  const validateForm = (fields: FieldConfig[]): boolean => {
    const errors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name];

      if (field.required && (!value || value.toString().trim() === '')) {
        errors[field.name] = `${field.label} is required`;
        return;
      }

      if (value) {
        // Email validation
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field.name] = 'Invalid email address';
          }
        }

        // Phone validation
        if (field.type === 'tel' && field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors[field.name] = 'Invalid phone number format';
          }
        }

        // Min/Max length validation
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          errors[field.name] = `Minimum ${field.validation.minLength} characters required`;
        }

        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          errors[field.name] = `Maximum ${field.validation.maxLength} characters allowed`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = async (user?: User) => {
    if (user) {
      setEditingUser(user);
      const { customFields, ...userData } = user;
      setFormData(userData);
      setUserCustomFields(user.customFields || []);
    } else {
      setEditingUser(null);
      setFormData({});
      setUserCustomFields([]);
    }
    setFormErrors({});
    
    // Reload fields to ensure we have the latest
    try {
      const latestFields = await FieldStore.getFields();
      setGlobalFields(latestFields);
    } catch (error) {
      console.error('Error loading fields:', error);
    }
    
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({});
    setFormErrors({});
    setUserCustomFields([]);
  };

  const handleAddCustomField = () => {
    if (!newCustomField.name || !newCustomField.label) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Field name and label are required',
      });
      return;
    }

    // Check if field name already exists in global or custom fields
    const allFields = getAllFieldsForUser();
    if (allFields.some(f => f.name === newCustomField.name)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Field',
        description: 'A field with this name already exists',
      });
      return;
    }

    const fieldConfig: FieldConfig = {
      id: `custom-${Date.now()}`,
      name: newCustomField.name,
      label: newCustomField.label,
      type: newCustomField.type || 'text',
      required: newCustomField.required || false,
      placeholder: newCustomField.placeholder,
    };

    setUserCustomFields([...userCustomFields, fieldConfig]);
    setNewCustomField({ type: 'text', required: false });
    setIsAddFieldDialogOpen(false);

    toast({
      title: 'Field Added',
      description: `"${fieldConfig.label}" has been added to this user`,
    });
  };

  const handleRemoveCustomField = (fieldId: string) => {
    const fieldToRemove = userCustomFields.find(f => f.id === fieldId);
    
    // Also remove the field value from formData
    if (fieldToRemove) {
      const { [fieldToRemove.name]: _, ...remainingFormData } = formData;
      setFormData(remainingFormData);
    }
    
    setUserCustomFields(userCustomFields.filter(f => f.id !== fieldId));
    toast({
      title: 'Field Removed',
      description: 'Custom field has been removed',
    });
  };

  const handleSubmit = async () => {
    const allFields = getAllFieldsForUser();
    
    if (!validateForm(allFields)) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up formData by removing any keys that are in customFields
      // (to handle the case where a custom field was deleted)
      const customFieldNames = userCustomFields.map(f => f.name);
      const cleanedFormData: Record<string, any> = {};
      Object.keys(formData).forEach(key => {
        if (!customFieldNames.includes(key)) {
          cleanedFormData[key] = formData[key];
        }
      });

      const userData = {
        ...cleanedFormData,
        customFields: userCustomFields.length > 0 ? userCustomFields : [],
      };

      if (editingUser) {
        await UserAPI.update(editingUser.id, userData);
        toast({
          title: 'User Updated',
          description: 'User information has been updated successfully',
        });
      } else {
        await UserAPI.create(userData);
        toast({
          title: 'User Created',
          description: 'New user has been created successfully',
        });
      }
      await loadData();
      handleCloseDialog();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${editingUser ? 'update' : 'create'} user`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await UserAPI.delete(userId);
      toast({
        title: 'User Deleted',
        description: 'User has been deleted successfully',
      });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user',
      });
    }
  };

  const renderFieldInput = (field: FieldConfig) => {
    const value = formData[field.name] || '';
    const error = formErrors[field.name];

    return (
      <div key={field.id} className="grid gap-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
          {field.id.startsWith('custom-') && (
            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              Custom Field
            </span>
          )}
        </Label>
        {field.type === 'textarea' ? (
          <textarea
            id={field.name}
            value={value}
            onChange={(e) =>
              setFormData({ ...formData, [field.name]: e.target.value })
            }
            placeholder={field.placeholder}
            className="flex min-h-[80px] w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0 focus-visible:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          />
        ) : (
          <Input
            id={field.name}
            type={field.type}
            value={value}
            onChange={(e) =>
              setFormData({ ...formData, [field.name]: e.target.value })
            }
            placeholder={field.placeholder}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const allUniqueFields = getAllUniqueFields();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                User Management
              </h1>
              <p className="text-slate-600">
                Create, view, edit, and delete user records with custom fields
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/form-builder">
                <Button variant="outline" size="lg" className="gap-2">
                  <Settings2 className="h-5 w-5" />
                  Configure Global Fields
                </Button>
              </Link>
              <Button
                size="lg"
                onClick={() => handleOpenDialog()}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 overflow-hidden">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No users yet
              </h3>
              <p className="text-slate-600 mb-4">
                Get started by creating your first user with custom fields
              </p>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b-2 border-slate-200">
                  <tr>
                    {allUniqueFields.map((field) => (
                      <th
                        key={field.id}
                        className="px-6 py-4 text-left text-sm font-semibold text-slate-900"
                      >
                        {field.label}
                        {field.id.startsWith('custom-') && (
                          <span className="ml-2 text-xs text-purple-600">
                            (Custom)
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-indigo-50/50 transition-colors"
                    >
                      {allUniqueFields.map((field) => (
                        <td
                          key={field.id}
                          className="px-6 py-4 text-sm text-slate-700"
                        >
                          {user[field.name] || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(user)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Global Fields</p>
              <p className="text-3xl font-bold text-purple-600">{globalFields.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Fields Used</p>
              <p className="text-3xl font-bold text-pink-600">{allUniqueFields.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Dialog (Create/Edit) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editingUser ? 'Edit User' : 'Create New User'}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddFieldDialogOpen(true)}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Custom Field
              </Button>
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Update user information and add custom fields specific to this user'
                : 'Fill in the details and add custom fields for this user'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Global Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg">
                  Global Fields ({globalFields.length})
                </span>
              </h3>
              {globalFields.length === 0 ? (
                <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                  No global fields configured. Go to Form Builder to add fields.
                </div>
              ) : (
                globalFields.map((field) => renderFieldInput(field))
              )}
            </div>

            {/* Custom Fields */}
            {userCustomFields.length > 0 && (
              <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">
                    Custom Fields for This User ({userCustomFields.length})
                  </span>
                </h3>
                {userCustomFields.map((field) => (
                  <div key={field.id} className="relative">
                    {renderFieldInput(field)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomField(field.id)}
                      className="absolute top-0 right-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Field Dialog */}
      <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
            <DialogDescription>
              Create a custom field for this specific user only
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="custom-field-name">Field Name *</Label>
              <Input
                id="custom-field-name"
                placeholder="e.g., emergencyContact"
                value={newCustomField.name || ''}
                onChange={(e) =>
                  setNewCustomField({ ...newCustomField, name: e.target.value })
                }
              />
              <p className="text-xs text-slate-500">
                Use camelCase for field names (e.g., emergencyContact, favoriteColor)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="custom-field-label">Field Label *</Label>
              <Input
                id="custom-field-label"
                placeholder="e.g., Emergency Contact"
                value={newCustomField.label || ''}
                onChange={(e) =>
                  setNewCustomField({ ...newCustomField, label: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="custom-field-type">Field Type</Label>
              <Select
                value={newCustomField.type || 'text'}
                onValueChange={(value) =>
                  setNewCustomField({ ...newCustomField, type: value as FieldType })
                }
              >
                <SelectTrigger id="custom-field-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="tel">Phone</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="custom-field-placeholder">Placeholder (Optional)</Label>
              <Input
                id="custom-field-placeholder"
                placeholder="e.g., Enter contact number"
                value={newCustomField.placeholder || ''}
                onChange={(e) =>
                  setNewCustomField({ ...newCustomField, placeholder: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="custom-field-required"
                checked={newCustomField.required}
                onCheckedChange={(checked) =>
                  setNewCustomField({ ...newCustomField, required: checked as boolean })
                }
              />
              <Label
                htmlFor="custom-field-required"
                className="text-sm font-normal cursor-pointer"
              >
                This field is required
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddFieldDialogOpen(false);
                setNewCustomField({ type: 'text', required: false });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCustomField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}