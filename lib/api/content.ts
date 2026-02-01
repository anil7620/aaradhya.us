// Client-side API for homepage content
export const contentApi = {
  async getHomepage() {
    const response = await fetch('/api/homepage', {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch homepage content')
    }
    
    const data = await response.json()
    return data
  },
}
