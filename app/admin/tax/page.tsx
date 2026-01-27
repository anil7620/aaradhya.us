'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save, Search, DollarSign, Check, X } from 'lucide-react'

interface TaxSetting {
  _id?: string
  stateCode: string
  stateName: string
  taxRate: number
  enabled: boolean
  notes?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
  },
}

export default function AdminTaxPage() {
  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all')

  const fetchTaxSettings = async () => {
    try {
      const res = await fetch('/api/admin/tax')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tax settings')
      setTaxSettings(data.taxSettings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tax settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxSettings()
  }, [])

  const handleUpdate = (index: number, field: keyof TaxSetting, value: any) => {
    const updated = [...taxSettings]
    updated[index] = { ...updated[index], [field]: value }
    setTaxSettings(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    setError('')

    try {
      const res = await fetch('/api/admin/tax', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxSettings }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save tax settings')

      setMessage(`Successfully updated ${data.modifiedCount} tax settings`)
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tax settings')
    } finally {
      setSaving(false)
    }
  }

  const filteredSettings = taxSettings.filter((setting) => {
    const matchesSearch =
      setting.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.stateCode.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter =
      filterEnabled === 'all' ||
      (filterEnabled === 'enabled' && setting.enabled) ||
      (filterEnabled === 'disabled' && !setting.enabled)

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tax settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-white/60 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Tax Configuration
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  US Sales Tax Settings
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage sales tax rates for all US states. Rates are applied during checkout based on shipping address.
                </p>
              </div>
            </div>
          </motion.div>

          {message && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
            >
              {message}
            </motion.div>
          )}

          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
            >
              {error}
            </motion.div>
          )}

          {/* Search and Filter */}
          <motion.div variants={itemVariants} className="mb-6 bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by state name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterEnabled === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterEnabled('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterEnabled === 'enabled' ? 'default' : 'outline'}
                  onClick={() => setFilterEnabled('enabled')}
                  size="sm"
                >
                  Enabled
                </Button>
                <Button
                  variant={filterEnabled === 'disabled' ? 'default' : 'outline'}
                  onClick={() => setFilterEnabled('disabled')}
                  size="sm"
                >
                  Disabled
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Tax Settings Table */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tax Rate (%)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSettings.map((setting, index) => (
                    <tr key={setting.stateCode} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-gray-900">{setting.stateName}</div>
                          <div className="text-sm text-gray-500">{setting.stateCode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={setting.taxRate}
                          onChange={(e) =>
                            handleUpdate(index, 'taxRate', parseFloat(e.target.value) || 0)
                          }
                          className="w-24"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleUpdate(index, 'enabled', !setting.enabled)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            setting.enabled
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {setting.enabled ? (
                            <>
                              <Check className="w-4 h-4" />
                              Enabled
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Disabled
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          placeholder="Optional notes..."
                          value={setting.notes || ''}
                          onChange={(e) => handleUpdate(index, 'notes', e.target.value)}
                          className="w-full max-w-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div variants={itemVariants} className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-6 text-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            variants={itemVariants}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tax Rate Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tax rates are applied during checkout based on the shipping address state</li>
              <li>• Disabled states will have 0% tax applied</li>
              <li>• Rates should be entered as percentages (e.g., 7.25 for 7.25%)</li>
              <li>• Changes take effect immediately after saving</li>
              <li>• You can search and filter to quickly find specific states</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
