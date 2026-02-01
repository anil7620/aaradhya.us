'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCSRFHeaders } from '@/lib/csrf-client'

interface Address {
  id: string
  label?: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault?: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    label: '',
    type: 'OTHER' as 'HOME' | 'WORK' | 'OTHER',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false,
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) return

      const res = await fetch('/api/user/addresses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        alert('Please log in to save addresses')
        return
      }

      const headers = {
        ...getCSRFHeaders(),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      const url = editingId
        ? `/api/user/addresses/${editingId}`
        : '/api/user/addresses'

      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save address')
      }

      await fetchAddresses()
      resetForm()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) return

      const headers = {
        ...getCSRFHeaders(),
        Authorization: `Bearer ${token}`,
      }

      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
        headers,
      })

      if (res.ok) {
        await fetchAddresses()
      }
    } catch (err) {
      console.error('Error deleting address:', err)
      alert('Failed to delete address')
    }
  }

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label || '',
      type: (address as any).type || 'OTHER',
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault || false,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      label: '',
      type: 'OTHER',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      isDefault: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 md:py-4 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-3 md:mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Manage your shipping addresses
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Address</span>
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 mb-3 md:mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="type" className="text-xs md:text-sm">Address Type *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'HOME' | 'WORK' | 'OTHER' })}
                    className="w-full h-9 md:h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="label" className="text-xs md:text-sm">Label (Optional)</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Custom label"
                    className="h-9 md:h-10 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="street" className="text-xs md:text-sm">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                  className="h-9 md:h-10 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city" className="text-xs md:text-sm">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="h-9 md:h-10 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-xs md:text-sm">State (2-letter) *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    placeholder="CA, NY, TX"
                    maxLength={2}
                    required
                    className="h-9 md:h-10 text-sm uppercase"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="zipCode" className="text-xs md:text-sm">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="12345"
                    required
                    className="h-9 md:h-10 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-xs md:text-sm">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    readOnly
                    className="h-9 md:h-10 text-sm bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isDefault" className="text-xs md:text-sm cursor-pointer">
                  Set as default address
                </Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1 text-sm">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Address
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="text-sm">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
              No saved addresses
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mb-4">
              Add an address to speed up checkout
            </p>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4 relative"
              >
                {address.isDefault && (
                  <div className="absolute top-2 right-2 bg-primary text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                    Default
                  </div>
                )}
                <div className="pr-16">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-900">
                      {address.label || (address as any).type || 'Address'}
                    </h3>
                    {(address as any).type && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {(address as any).type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    {address.street}<br />
                    {address.city}, {address.state} {address.zipCode}<br />
                    {address.country}
                  </p>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(address)}
                    className="flex-1 text-xs"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
