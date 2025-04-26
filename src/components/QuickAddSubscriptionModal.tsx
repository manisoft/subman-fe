import React, { useState } from 'react';
import { Button, Input, Label, Dialog, DialogSurface, DialogBody, DialogTitle, DialogActions, Spinner, Dropdown, Option } from '@fluentui/react-components';

export interface QuickAddSubscriptionModalFields {
  name: string;
  logo: string;
  color: string;
  category: string;
  price: string;
  billingCycle: string;
  nextBillingDate: string;
  description?: string;
  website?: string;
  notes?: string;
}

interface QuickAddSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (fields: QuickAddSubscriptionModalFields) => void;
  prefill: { name: string; logo: string; color: string; category: string };
  loading?: boolean;
  error?: string;
}


const BILLING_CYCLES = [
  { key: 'weekly', text: 'Weekly' },
  { key: 'biweekly', text: 'Bi-Weekly' },
  { key: 'monthly', text: 'Monthly' },
  { key: 'quarterly', text: 'Quarterly' },
  { key: 'yearly', text: 'Yearly' },
];

export default function QuickAddSubscriptionModal({ open, onClose, onSave, prefill, loading = false, error = '' }: QuickAddSubscriptionModalProps) {
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: prefill.name,
      logo: prefill.logo,
      color: prefill.color,
      category: prefill.category,
      price,
      billingCycle,
      nextBillingDate,
      description,
      website,
      notes,
    });
  };

  return (
    <Dialog open={open} modalType="alert">
      <DialogSurface>
        <form onSubmit={handleSave}>
          <DialogBody>
            <DialogTitle>
              Add Subscription: <span style={{ fontWeight: 600 }}>{prefill.name}</span>
            </DialogTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
              <Label htmlFor="quickadd-price">Price ($)</Label>
              <Input id="quickadd-price" type="number" value={price} onChange={e => setPrice((e.target as HTMLInputElement).value)} required />

              <Label htmlFor="quickadd-billing">Billing Cycle</Label>
              <Dropdown
                id="quickadd-billing"
                value={billingCycle}
                onOptionSelect={(_event, data) => setBillingCycle(data.optionValue || 'monthly')}
              >
                {BILLING_CYCLES.map(c => (
                  <Option key={c.key} value={c.key}>{c.text}</Option>
                ))}
              </Dropdown>

              <Label htmlFor="quickadd-date">Next Billing Date</Label>
              <Input id="quickadd-date" type="date" value={nextBillingDate} onChange={e => setNextBillingDate((e.target as HTMLInputElement).value)} required />

              <Label htmlFor="quickadd-description">Description (optional)</Label>
              <Input id="quickadd-description" value={description} onChange={e => setDescription((e.target as HTMLInputElement).value)} />

              <Label htmlFor="quickadd-website">Website</Label>
              <Input id="quickadd-website" value={website} onChange={e => setWebsite((e.target as HTMLInputElement).value)} />

              <Label htmlFor="quickadd-notes">Notes</Label>
              <Input id="quickadd-notes" value={notes} onChange={e => setNotes((e.target as HTMLInputElement).value)} />
            </div>
            {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button appearance="primary" type="submit" disabled={loading}>{loading ? <Spinner size="tiny" /> : 'Save Subscription'}</Button>
          </DialogActions>
        </form>
      </DialogSurface>
    </Dialog>
  );
}

