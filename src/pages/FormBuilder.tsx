import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings2, Trash2, Users } from 'lucide-react';
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
import { FieldStore } from '../types/fieldstore';
import { FieldConfig, FieldType } from '../types/fields';
import { useToast } from '../hooks/use-toast';

export function FormBuilder() {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newField, setNewField] = useState<Partial<FieldConfig>>({
    type: 'text',
    required: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    setIsLoading(true);
    try {
      const loadedFields = await FieldStore.getFields();
      setFields(loadedFields);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load fields',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.name || !newField.label) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Field name and label are required',
      });
      return;
    }

    const fieldConfig: FieldConfig = {
      id: `field-${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type || 'text',
      required: newField.required || false,
      placeholder: newField.placeholder,
    };

    try {
      await FieldStore.addField(fieldConfig);
      await loadFields();

      toast({
        title: 'Field Added',
        description: `"${fieldConfig.label}" has been added to the form`,
      });

      setNewField({ type: 'text', required: false });
      setIsAddFieldOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add field',
      });
    }
  };

  const handleRemoveField = async (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    
    try {
      await FieldStore.removeField(fieldId);
      await loadFields();

      toast({
        title: 'Field Removed',
        description: `"${field?.label}" has been removed from the form`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove field',
      });
    }
  };

  const handleResetToDefault = async () => {
    try {
      await FieldStore.resetToDefault();
      await loadFields();

      toast({
        title: 'Reset Complete',
        description: 'Form fields have been reset to default configuration',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reset fields',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Form Builder
              </h1>
              <p className="text-slate-600">
                Configure your user form fields dynamically
              </p>
            </div>
            <Link to="/users">
              <Button size="lg" className="gap-2">
                <Users className="h-5 w-5" />
                Manage Users
              </Button>
            </Link>
          </div>
        </div>

        {/* Form Configuration Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                <Settings2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Form Fields
                </h2>
                <p className="text-sm text-slate-500">
                  {fields.length} field{fields.length !== 1 ? 's' : ''} configured
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
              >
                Reset to Default
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddFieldOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-slate-900">{field.label}</h3>
                    {field.required && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1">
                    <p className="text-sm text-slate-500">
                      Name: <span className="font-mono">{field.name}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Type: <span className="capitalize">{field.type}</span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveField(field.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-100">
          <h3 className="font-semibold text-slate-900 mb-2">
            How to extend the form
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-indigo-600">•</span>
              Click "Add Field" to create new form fields dynamically
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-600">•</span>
              Specify field name, label, type, and whether it's required
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-600">•</span>
              Fields are automatically validated in the user form
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-600">•</span>
              Use "Manage Users" to create, edit, and delete user records
            </li>
          </ul>
        </div>
      </div>

      {/* Add Field Dialog */}
      <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Field</DialogTitle>
            <DialogDescription>
              Create a new field for the user form. All fields will be available
              immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="field-name">Field Name *</Label>
              <Input
                id="field-name"
                placeholder="e.g., dateOfBirth"
                value={newField.name || ''}
                onChange={(e) =>
                  setNewField({ ...newField, name: e.target.value })
                }
              />
              <p className="text-xs text-slate-500">
                Use camelCase for field names (e.g., dateOfBirth, homeAddress)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="field-label">Field Label *</Label>
              <Input
                id="field-label"
                placeholder="e.g., Date of Birth"
                value={newField.label || ''}
                onChange={(e) =>
                  setNewField({ ...newField, label: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="field-type">Field Type</Label>
              <Select
                value={newField.type || 'text'}
                onValueChange={(value) =>
                  setNewField({ ...newField, type: value as FieldType })
                }
              >
                <SelectTrigger id="field-type">
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
              <Label htmlFor="field-placeholder">Placeholder (Optional)</Label>
              <Input
                id="field-placeholder"
                placeholder="e.g., MM/DD/YYYY"
                value={newField.placeholder || ''}
                onChange={(e) =>
                  setNewField({ ...newField, placeholder: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-required"
                checked={newField.required}
                onCheckedChange={(checked) =>
                  setNewField({ ...newField, required: checked as boolean })
                }
              />
              <Label
                htmlFor="field-required"
                className="text-sm font-normal cursor-pointer"
              >
                This field is required
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddFieldOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}