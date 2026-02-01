'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'
import { HomepageContent } from '@/lib/models/HomepageContent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function HomepageEditorPage() {
  const router = useRouter()
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetch('/api/homepage')
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setContent(data.content)
        } else {
          // Initialize with default structure if no content exists
          setContent({
            hero: {
              id: 'hero',
              title: 'Premium',
              subtitle: 'Puja Items',
              description: 'Discover our exquisite collection of premium puja items and handcrafted brass products. Perfect for worship, home decor, and spiritual occasions.',
              buttonText: 'Shop Now',
              buttonLink: '/products',
             
              stats: [
                {
                  number: '5000+',
                  label: 'Happy Customers',
                },
              ],
            },
            features: [
              {
                id: 'feature1',
                title: '5000+ Orders Delivered',
                description: 'Trusted by customers nationwide',
                icon: '🚚',
              },
              {
                id: 'feature2',
                title: 'Nationwide USA Delivery',
                description: 'Fast & secure shipping across all US states',
                icon: '📦',
              },
              {
                id: 'feature3',
                title: 'Handcrafted with Love',
                description: 'Premium quality, unique designs',
                icon: '✨',
              },
            ],
            announcementBar: {
              enabled: true,
              offers: [
                {
                  text: 'FREE SHIPPING on orders above $30',
                  icon: '🚚',
                },
                {
                  text: 'Get 5% OFF on orders above $60',
                  icon: '🎉',
                },
              ],
            },
            footer: {
              tagline: 'Creating premium puja items and handcrafted brass products that bring spirituality, elegance, and divine blessings to your home and worship.',
              menuItems: [
                {
                  title: 'Quick Links',
                  links: [
                    { text: 'Home', url: '/' },
                    { text: 'Shop All', url: '/products' },
                    { text: 'About Us', url: '/about' },
                    { text: 'Contact', url: '/contact' },
                  ],
                },
                {
                  title: 'Categories',
                  links: [
                    { text: 'Puja Items', url: '/products?category=puja' },
                    { text: 'Brass Products', url: '/products?category=brass' },
                    { text: 'Gift Sets', url: '/products' },
                    { text: 'Corporate Orders', url: '/products' },
                  ],
                },
                {
                  title: 'Resources',
                  links: [
                    { text: 'Help', url: '/help' },
                    { text: 'Delivery Policy', url: '/delivery-policy' },
                    { text: 'Quality Guarantee', url: '/quality-guarantee' },
                  ],
                },
                {
                  title: 'Social',
                  links: [
                    { text: 'Instagram', url: '#' },
                    { text: 'Facebook', url: '#' },
                    { text: 'YouTube', url: '#' },
                  ],
                },
              ],
              copyright: '© 2026 Aaradhya. All rights reserved.',
              bottomLinks: [
                { text: 'Terms and Conditions', url: '/terms' },
                { text: 'Privacy Policy', url: '/privacy' },
              ],
            },
            updatedAt: new Date(),
          })
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      alert('You must be logged in to save changes')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Save error:', data)
        alert(`Failed to save: ${data.error || 'Unknown error'}`)
        setSaving(false)
        return
      }

      alert('Homepage content saved successfully!')
      // Reload the page to show updated content
      window.location.reload()
    } catch (error) {
      console.error('Save error:', error)
      alert(`Error saving content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!content) {
    return <div className="container mx-auto px-4 py-8">No content found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Homepage Content</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={content.hero.title || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, title: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={content.hero.subtitle || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, subtitle: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={content.hero.description || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, description: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input
                value={content.hero.buttonText || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, buttonText: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Button Link</Label>
              <Input
                value={content.hero.buttonLink || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, buttonLink: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Badge Text</Label>
              <Input
                value={content.hero.badge?.text || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: {
                    ...content.hero,
                    badge: { 
                      text: e.target.value,
                      icon: content.hero.badge?.icon 
                    }
                  }
                })}
              />
            </div>
            <div>
              <Label>Badge Icon (emoji)</Label>
              <Input
                value={content.hero.badge?.icon || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: {
                    ...content.hero,
                    badge: { 
                      text: content.hero.badge?.text || '', 
                      icon: e.target.value 
                    }
                  }
                })}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Feature Cards</h2>
          {content.features.map((feature, index) => (
            <div key={feature.id || index} className="border-b pb-4 mb-4 last:border-0">
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={feature.title || ''}
                    onChange={(e) => {
                      const newFeatures = [...content.features]
                      newFeatures[index] = { ...feature, title: e.target.value }
                      setContent({ ...content, features: newFeatures })
                    }}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={feature.description || ''}
                    onChange={(e) => {
                      const newFeatures = [...content.features]
                      newFeatures[index] = { ...feature, description: e.target.value }
                      setContent({ ...content, features: newFeatures })
                    }}
                  />
                </div>
                <div>
                  <Label>Icon (emoji)</Label>
                  <Input
                    value={feature.icon || ''}
                    onChange={(e) => {
                      const newFeatures = [...content.features]
                      newFeatures[index] = { ...feature, icon: e.target.value }
                      setContent({ ...content, features: newFeatures })
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Announcement Bar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Announcement Bar</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={content.announcementBar?.enabled || false}
                onChange={(e) => setContent({
                  ...content,
                  announcementBar: {
                    ...content.announcementBar,
                    enabled: e.target.checked
                  }
                })}
                className="w-4 h-4"
              />
              <Label>Enable Announcement Bar</Label>
            </div>
            {content.announcementBar?.offers?.map((offer, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-2">
                <div>
                  <Label>Offer Text</Label>
                  <Input
                    value={offer.text}
                    onChange={(e) => {
                      const newOffers = [...(content.announcementBar?.offers || [])]
                      newOffers[index] = { ...offer, text: e.target.value }
                      setContent({
                        ...content,
                        announcementBar: {
                          ...content.announcementBar,
                          offers: newOffers
                        }
                      })
                    }}
                  />
                </div>
                <div>
                  <Label>Icon (emoji)</Label>
                  <Input
                    value={offer.icon}
                    onChange={(e) => {
                      const newOffers = [...(content.announcementBar?.offers || [])]
                      newOffers[index] = { ...offer, icon: e.target.value }
                      setContent({
                        ...content,
                        announcementBar: {
                          ...content.announcementBar,
                          offers: newOffers
                        }
                      })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Footer</h2>
          <div className="space-y-6">
            {/* Tagline */}
            <div>
              <Label className="text-base font-medium mb-2 block">Tagline</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter footer tagline..."
                value={content.footer?.tagline || ''}
                onChange={(e) => setContent({
                  ...content,
                  footer: { 
                    ...content.footer, 
                    tagline: e.target.value,
                    menuItems: content.footer?.menuItems || [],
                    bottomLinks: content.footer?.bottomLinks || [],
                  }
                })}
              />
            </div>

            {/* Copyright */}
            <div>
              <Label className="text-base font-medium mb-2 block">Copyright Text</Label>
              <Input
                placeholder="© 2026 Aaradhya. All rights reserved."
                value={content.footer?.copyright || ''}
                onChange={(e) => setContent({
                  ...content,
                  footer: { 
                    ...content.footer, 
                    copyright: e.target.value,
                    menuItems: content.footer?.menuItems || [],
                    bottomLinks: content.footer?.bottomLinks || [],
                  }
                })}
              />
            </div>
            
            {/* Menu Items */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Menu Sections</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newMenuItems = [...(content.footer?.menuItems || [])]
                    newMenuItems.push({
                      title: 'New Section',
                      links: [{ text: 'New Link', url: '#' }]
                    })
                    setContent({
                      ...content,
                      footer: { 
                        ...content.footer, 
                        menuItems: newMenuItems,
                        bottomLinks: content.footer?.bottomLinks || [],
                      }
                    })
                  }}
                >
                  + Add Section
                </Button>
              </div>
              
              {(!content.footer?.menuItems || content.footer.menuItems.length === 0) && (
                <p className="text-sm text-gray-500 mb-4">No menu sections yet. Click "Add Section" to create one.</p>
              )}

              {content.footer?.menuItems?.map((menuItem, menuIndex) => (
                <div key={menuIndex} className="border border-gray-200 p-4 rounded-lg mb-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Section {menuIndex + 1}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMenuItems = [...(content.footer?.menuItems || [])]
                        newMenuItems.splice(menuIndex, 1)
                        setContent({
                          ...content,
                          footer: { 
                            ...content.footer, 
                            menuItems: newMenuItems,
                            bottomLinks: content.footer?.bottomLinks || [],
                          }
                        })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label className="text-sm">Section Title</Label>
                    <Input
                      value={menuItem.title}
                      onChange={(e) => {
                        const newMenuItems = [...(content.footer?.menuItems || [])]
                        newMenuItems[menuIndex] = { ...menuItem, title: e.target.value }
                        setContent({
                          ...content,
                          footer: { 
                            ...content.footer, 
                            menuItems: newMenuItems,
                            bottomLinks: content.footer?.bottomLinks || [],
                          }
                        })
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Links</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newMenuItems = [...(content.footer?.menuItems || [])]
                          const newLinks = [...menuItem.links, { text: 'New Link', url: '#' }]
                          newMenuItems[menuIndex] = { ...menuItem, links: newLinks }
                          setContent({
                            ...content,
                            footer: { 
                              ...content.footer, 
                              menuItems: newMenuItems,
                              bottomLinks: content.footer?.bottomLinks || [],
                            }
                          })
                        }}
                      >
                        + Add Link
                      </Button>
                    </div>
                    {menuItem.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Link text"
                          value={link.text}
                          onChange={(e) => {
                            const newMenuItems = [...(content.footer?.menuItems || [])]
                            const newLinks = [...menuItem.links]
                            newLinks[linkIndex] = { ...link, text: e.target.value }
                            newMenuItems[menuIndex] = { ...menuItem, links: newLinks }
                            setContent({
                              ...content,
                              footer: { 
                                ...content.footer, 
                                menuItems: newMenuItems,
                                bottomLinks: content.footer?.bottomLinks || [],
                              }
                            })
                          }}
                        />
                        <Input
                          placeholder="URL (e.g., /products)"
                          value={link.url}
                          onChange={(e) => {
                            const newMenuItems = [...(content.footer?.menuItems || [])]
                            const newLinks = [...menuItem.links]
                            newLinks[linkIndex] = { ...link, url: e.target.value }
                            newMenuItems[menuIndex] = { ...menuItem, links: newLinks }
                            setContent({
                              ...content,
                              footer: { 
                                ...content.footer, 
                                menuItems: newMenuItems,
                                bottomLinks: content.footer?.bottomLinks || [],
                              }
                            })
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newMenuItems = [...(content.footer?.menuItems || [])]
                            const newLinks = menuItem.links.filter((_, idx) => idx !== linkIndex)
                            newMenuItems[menuIndex] = { ...menuItem, links: newLinks }
                            setContent({
                              ...content,
                              footer: { 
                                ...content.footer, 
                                menuItems: newMenuItems,
                                bottomLinks: content.footer?.bottomLinks || [],
                              }
                            })
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Links */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bottom Links</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newBottomLinks = [...(content.footer?.bottomLinks || [])]
                    newBottomLinks.push({ text: 'New Link', url: '#' })
                    setContent({
                      ...content,
                      footer: { 
                        ...content.footer, 
                        bottomLinks: newBottomLinks,
                        menuItems: content.footer?.menuItems || [],
                      }
                    })
                  }}
                >
                  + Add Link
                </Button>
              </div>

              {(!content.footer?.bottomLinks || content.footer.bottomLinks.length === 0) && (
                <p className="text-sm text-gray-500 mb-4">No bottom links yet. Click "Add Link" to create one.</p>
              )}

              {content.footer?.bottomLinks?.map((link, linkIndex) => (
                <div key={linkIndex} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Link text (e.g., Terms and Conditions)"
                    value={link.text}
                    onChange={(e) => {
                      const newBottomLinks = [...(content.footer?.bottomLinks || [])]
                      newBottomLinks[linkIndex] = { ...link, text: e.target.value }
                      setContent({
                        ...content,
                        footer: { 
                          ...content.footer, 
                          bottomLinks: newBottomLinks,
                          menuItems: content.footer?.menuItems || [],
                        }
                      })
                    }}
                  />
                  <Input
                    placeholder="URL (e.g., /terms)"
                    value={link.url}
                    onChange={(e) => {
                      const newBottomLinks = [...(content.footer?.bottomLinks || [])]
                      newBottomLinks[linkIndex] = { ...link, url: e.target.value }
                      setContent({
                        ...content,
                        footer: { 
                          ...content.footer, 
                          bottomLinks: newBottomLinks,
                          menuItems: content.footer?.menuItems || [],
                        }
                      })
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newBottomLinks = content.footer?.bottomLinks?.filter((_, idx) => idx !== linkIndex) || []
                      setContent({
                        ...content,
                        footer: { 
                          ...content.footer, 
                          bottomLinks: newBottomLinks,
                          menuItems: content.footer?.menuItems || [],
                        }
                      })
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

