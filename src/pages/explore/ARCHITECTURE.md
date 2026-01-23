# Explore Section - Information Architecture

## Research-Based Design Patterns

### Inspiration Sources (Abstracted Patterns)
- **Medium/TED**: Editorial layouts, comfortable reading width, tag-based filtering
- **National Geographic**: Visual storytelling, image-text harmony, timeline narratives
- **WHO/UN Platforms**: Trust signals, impact statistics, accessible content structure
- **Modern Editorial Sites**: Infinite scroll, category filters, author profiles

### Core Principles Extracted
1. **Information Hierarchy**: Clear visual hierarchy with strong typography
2. **Content Discovery**: Multiple entry points (categories, tags, search, featured)
3. **Trust Building**: Statistics, testimonials, visual proof
4. **Accessibility**: Semantic HTML, keyboard navigation, screen reader support
5. **Performance**: Lazy loading, pagination, optimized assets

## Page Architecture

### 1. About the Ashram (`/explore/about`)

**Information Architecture:**
```
Hero Section (Emotional Hook)
├── Large hero image with overlay text
├── Key message: "A Sanctuary for Transformation"
└── CTA: "Plan Your Visit"

Ashram History Timeline
├── Vertical timeline component
├── Key milestones (1980s → Present)
├── Expandable details per milestone
└── Visual indicators (icons, images)

Daily Life at the Ashram
├── Morning routine
├── Meditation & practice
├── Community activities
└── Evening programs

Facilities & Spaces
├── Grid layout with cards
├── Images + descriptions
├── Categories: Accommodation, Meditation Halls, Dining, Gardens
└── Interactive gallery

Global Significance
├── Map visualization
├── Visitor statistics
├── Global reach metrics
└── Cultural impact

Interactive Map / Gallery
├── Embedded map (lazy loaded)
├── Photo gallery with lightbox
└── Virtual tour link (future)

Call-to-Action
├── Visit planning
├── Program booking
└── Contact information
```

**Data Model:**
- Timeline events (date, title, description, image)
- Facilities (id, name, type, description, images, capacity)
- Statistics (visitors, countries, programs)

### 2. Mission & Vision (`/explore/mission`)

**Information Architecture:**
```
Hero Section
├── Vision statement (large, centered)
└── Subtitle: "Transforming Lives, One Breath at a Time"

Mission Pillars
├── 4-6 core pillars
├── Icon + title + description
└── Visual cards in grid

Core Values
├── Value cards with icons
├── Short descriptions
└── Visual emphasis

Global Impact Stats
├── Animated counters
├── Categories: People, Countries, Programs, Initiatives
└── Visual charts/graphs (future)

Leadership Quotes
├── Featured quote carousel
├── Author attribution
└── Context/background

Future Roadmap
├── High-level vision
├── Upcoming initiatives
└── Call to participate
```

**Data Model:**
- Mission pillars (id, title, description, icon, order)
- Core values (id, name, description, icon)
- Impact statistics (category, value, label, trend)
- Quotes (id, text, author, role, image)

### 3. Articles & Blogs (`/explore/articles`)

**Information Architecture:**
```
Hero / Featured Section
├── Latest featured article (large card)
├── 2-3 secondary featured articles
└── Visual hierarchy

Category Filters
├── Horizontal filter bar
├── Categories: All, Wisdom, Wellness, Events, Stories
└── Active state indication

Tag System
├── Popular tags cloud
├── Click to filter
└── Tag count indicators

Article Grid
├── Responsive grid (1-3 columns)
├── Article cards with:
│   ├── Featured image
│   ├── Title
│   ├── Excerpt
│   ├── Author + date
│   ├── Reading time
│   └── Tags
└── Infinite scroll / pagination

Search Bar
├── Full-text search
├── Debounced input
└── Search results highlighting

Author Profiles
├── Author cards in sidebar/footer
├── Bio + article count
└── Link to author page (future)
```

**Data Model:**
- Articles (id, title, slug, excerpt, content, author, date, readingTime, category, tags, featuredImage, featured)
- Categories (id, name, slug, description, articleCount)
- Tags (id, name, slug, articleCount)
- Authors (id, name, bio, avatar, articleCount)

**Data Structures:**
- Indexed content map: `Map<articleId, Article>` for O(1) lookup
- Tag index: `Map<tagId, Set<articleId>>` for O(1) tag filtering
- Category index: `Map<categoryId, Article[]>` for fast category filtering

### 4. Videos & Talks (`/explore/videos`)

**Information Architecture:**
```
Hero / Featured Section
├── Featured video (large player)
├── Title + description
└── Play button overlay

Category Tabs
├── Tabs: All, Wisdom, Meditation, Talks, Events
├── Active tab indication
└── Count per category

Video Grid
├── Netflix-style responsive grid
├── Video cards with:
│   ├── Thumbnail + play overlay
│   ├── Duration badge
│   ├── Title
│   ├── Speaker name
│   ├── View count
│   └── Date
└── Lazy loading

Playlist View
├── Grouped by series/topic
├── Collapsible playlists
└── Play all option

Video Detail (Modal/Page)
├── Video player
├── Description
├── Speaker info
├── Transcript section (expandable)
├── Related videos
└── Share options

Search
├── Search by title, speaker, topic
├── Filtered results
└── Highlight matches
```

**Data Model:**
- Videos (id, title, description, url, thumbnail, duration, speaker, category, views, date, transcript, playlistId, featured)
- Categories (id, name, slug, videoCount)
- Playlists (id, name, description, videos, thumbnail)
- Speakers (id, name, bio, avatar, videoCount)

**Data Structures:**
- Video index: `Map<videoId, Video>` for O(1) lookup
- Category index: `Map<categoryId, Video[]>` for category filtering
- Speaker index: `Map<speakerId, Video[]>` for speaker filtering
- Search index: Inverted index for full-text search

### 5. Testimonials (`/explore/testimonials`)

**Information Architecture:**
```
Hero Section
├── Inspirational quote
├── Subtitle: "Stories of Transformation"
└── CTA: "Share Your Story"

Featured Testimonials
├── Large carousel
├── Video + text testimonials
└── Auto-rotate with manual control

Category Filters
├── Categories: All, Life, Health, Youth, Corporate
├── Filter buttons
└── Count per category

Testimonial Grid
├── Card-based layout
├── Testimonial cards with:
│   ├── Quote (highlighted)
│   ├── Author name + photo
│   ├── Location/country
│   ├── Category badge
│   ├── Video thumbnail (if video)
│   └── Read more / Watch
└── Smooth transitions

Video Testimonials
├── Embedded video players
├── Transcript option
└── Play controls

Text Testimonials
├── Quote emphasis
├── Full story (expandable)
└── Author details

Call-to-Share
├── "Share Your Experience" CTA
├── Form or link to submission
└── Community building
```

**Data Model:**
- Testimonials (id, quote, fullStory, author, location, country, category, type, videoUrl, thumbnail, date, featured, approved)
- Categories (id, name, slug, testimonialCount)
- Countries (code, name, testimonialCount)

**Data Structures:**
- Testimonial index: `Map<testimonialId, Testimonial>` for O(1) lookup
- Category index: `Map<categoryId, Testimonial[]>` for category filtering
- Country index: `Map<countryCode, Testimonial[]>` for location filtering
- Virtualized carousel: Only render visible items for performance

## Technical Architecture

### Component Structure
```
explore/
├── about/
│   ├── AboutAshramPage.tsx
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── TimelineSection.tsx
│   │   ├── DailyLifeSection.tsx
│   │   ├── FacilitiesSection.tsx
│   │   ├── GlobalSignificanceSection.tsx
│   │   └── MapGallerySection.tsx
│   └── data.ts
├── mission/
│   ├── MissionVisionPage.tsx
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── MissionPillarsSection.tsx
│   │   ├── CoreValuesSection.tsx
│   │   ├── ImpactStatsSection.tsx
│   │   ├── LeadershipQuotesSection.tsx
│   │   └── RoadmapSection.tsx
│   └── data.ts
├── articles/
│   ├── ArticlesPage.tsx
│   ├── components/
│   │   ├── FeaturedSection.tsx
│   │   ├── CategoryFilters.tsx
│   │   ├── TagCloud.tsx
│   │   ├── ArticleGrid.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── AuthorProfile.tsx
│   └── data.ts
├── videos/
│   ├── VideosPage.tsx
│   ├── components/
│   │   ├── FeaturedVideoSection.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── VideoGrid.tsx
│   │   ├── VideoCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── TranscriptSection.tsx
│   │   └── PlaylistView.tsx
│   └── data.ts
├── testimonials/
│   ├── TestimonialsPage.tsx
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedCarousel.tsx
│   │   ├── CategoryFilters.tsx
│   │   ├── TestimonialGrid.tsx
│   │   ├── TestimonialCard.tsx
│   │   └── ShareExperienceSection.tsx
│   └── data.ts
└── types.ts (shared types)
```

### Performance Optimizations

1. **Lazy Loading**
   - Images: `loading="lazy"` attribute
   - Videos: Load on demand
   - Components: React.lazy() for code splitting

2. **Pagination/Infinite Scroll**
   - Articles: 12 per page, infinite scroll
   - Videos: 16 per page, pagination
   - Testimonials: 9 per page, load more

3. **Caching**
   - Content data: localStorage cache (5 min TTL)
   - Images: Browser cache + CDN
   - Search results: Memoized

4. **Virtualization**
   - Testimonial carousel: Only render visible items
   - Long lists: Virtual scrolling

### SEO Strategy

1. **Meta Tags**
   - Dynamic title, description per page
   - Open Graph tags for social sharing
   - Schema.org markup (Article, VideoObject, Review)

2. **Semantic HTML**
   - Proper heading hierarchy (h1 → h6)
   - Article tags, time elements
   - Structured data

3. **URL Structure**
   - Clean, descriptive URLs
   - Slug-based routing
   - Canonical URLs

4. **Content Optimization**
   - Alt text for all images
   - Descriptive link text
   - Internal linking

### Accessibility

1. **Keyboard Navigation**
   - Tab order logical
   - Focus indicators visible
   - Skip links for main content

2. **Screen Readers**
   - ARIA labels where needed
   - Proper heading structure
   - Alt text for images
   - Live regions for dynamic content

3. **Visual**
   - Contrast ratios WCAG AA compliant
   - Text resizable
   - Color not sole indicator

4. **Motion**
   - Respect prefers-reduced-motion
   - Optional animations
   - No auto-play videos (with sound)

## Data Models

### Shared Types
```typescript
interface BaseContent {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  metadata?: Record<string, unknown>;
}

interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  role?: string;
}
```

### About Ashram
```typescript
interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  image?: string;
  significance?: string;
}

interface Facility {
  id: string;
  name: string;
  type: 'accommodation' | 'meditation' | 'dining' | 'garden' | 'other';
  description: string;
  images: string[];
  capacity?: number;
  features?: string[];
}
```

### Mission & Vision
```typescript
interface MissionPillar {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface CoreValue {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ImpactStat {
  id: string;
  category: string;
  value: number;
  label: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}
```

### Articles
```typescript
interface Article extends BaseContent {
  excerpt: string;
  content: string;
  author: Author;
  readingTime: number; // minutes
  category: ArticleCategory;
  tags: Tag[];
  featuredImage: string;
  publishedAt: string;
}

interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
}
```

### Videos
```typescript
interface Video extends BaseContent {
  description: string;
  url: string;
  thumbnail: string;
  duration: number; // seconds
  speaker: Author;
  category: VideoCategory;
  views: number;
  transcript?: string;
  playlistId?: string;
  publishedAt: string;
}

interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  videoCount?: number;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  videos: Video[];
  thumbnail?: string;
}
```

### Testimonials
```typescript
interface Testimonial {
  id: string;
  quote: string;
  fullStory?: string;
  author: {
    name: string;
    photo?: string;
    location?: string;
    country: string;
    role?: string;
  };
  category: TestimonialCategory;
  type: 'text' | 'video';
  videoUrl?: string;
  thumbnail?: string;
  date: string;
  featured?: boolean;
  approved: boolean;
}

interface TestimonialCategory {
  id: string;
  name: string;
  slug: string;
  testimonialCount?: number;
}
```

## Future Extensions

1. **CMS Integration**
   - All data models designed for easy CMS migration
   - API-ready structure
   - Version control support

2. **Advanced Features**
   - Comments on articles
   - Video playlists
   - Testimonial moderation workflow
   - Multi-language support
   - A/B testing for content

3. **Analytics**
   - Content engagement tracking
   - Popular content insights
   - User journey analysis

4. **Personalization**
   - Recommended content
   - User preferences
   - Reading history
