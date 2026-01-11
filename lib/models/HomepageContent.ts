import { ObjectId } from 'mongodb'

export interface HomepageSection {
  id: string
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  images?: string[]
  icon?: string
  badge?: {
    text: string
    icon?: string
  }
  stats?: Array<{
    number: string
    label: string
    icon?: string
  }>
}

export interface AnnouncementBar {
  enabled: boolean
  offers: Array<{
    text: string
    icon: string
    color?: string
  }>
}

export interface FooterContent {
  tagline?: string
  menuItems?: Array<{
    title: string
    links: Array<{
      text: string
      url: string
    }>
  }>
  copyright?: string
  bottomLinks?: Array<{
    text: string
    url: string
  }>
}

export interface HomepageContent {
  _id?: ObjectId
  hero: HomepageSection
  features: HomepageSection[]
  announcementBar: AnnouncementBar
  footer: FooterContent
  updatedAt: Date
  updatedBy?: ObjectId
}

