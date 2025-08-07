# Bhagavad Gita App 🕉️

A beautiful, interactive web application for reading and studying the Bhagavad Gita, built with React, TypeScript, and modern web technologies.

## ✨ Features

### 🏛️ **Dashboard Experience**

- Beautiful Sanskrit welcome page with spiritual design
- Gradient backgrounds inspired by traditional Indian art
- "Namaste" greeting to begin your spiritual journey
- Feature showcase cards highlighting app capabilities
- Sacred verse quotes with translations

### 📖 **Chapter Navigation**

- Browse all 18 chapters with beautiful overview cards
- Real-time search functionality across chapters
- Chapter cards display:
  - Sanskrit names with proper Devanagari fonts
  - Transliteration in Roman script
  - English translations and meanings
  - Verse counts and detailed summaries
- Live API integration for chapter data

### 🎯 **Chapter Detail View**

- Individual chapter pages with complete information
- Sticky navigation header with chapter details
- Sidebar with all verses for quick navigation
- Main content area featuring:
  - Chapter summary with spiritual context
  - Sanskrit verses with authentic Devanagari typography
  - Roman transliteration for pronunciation
  - English translations with commentary
  - Audio playback controls (UI ready)
  - Previous/Next verse navigation

### 🎨 **Design & User Experience**

- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Spiritual Aesthetics**: Warm oranges, reds, and golds
- **Typography**: Special Sanskrit fonts (Noto Sans Devanagari, Mangal)
- **Modern UI**: ShadCN components with glass morphism effects
- **Smooth Transitions**: Elegant animations and hover effects
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 🛠️ Tech Stack

### **Frontend**

- **React 19** with **TypeScript** for type safety
- **TanStack Router** for file-based routing
- **Zustand** for lightweight state management
- **Vite** for lightning-fast development and building

### **UI & Styling**

- **Tailwind CSS 4.0** for utility-first styling
- **ShadCN UI Components** for consistent design system
- **Lucide React** for beautiful icons
- **Custom CSS** for Sanskrit fonts and spiritual aesthetics

### **Development Tools**

- **Bun** as package manager for speed
- **Biome** for linting and formatting
- **TypeScript** for robust type checking
- **Hot Module Replacement** for instant development feedback

## 🔌 API Integration

The app integrates with the Bhagavad Gita API from RapidAPI for authentic spiritual content.

### **Current API Endpoints**

#### 1. Get All Chapters

```bash
curl --request GET \
  --url 'https://bhagavad-gita3.p.rapidapi.com/v2/chapters/?skip=0&limit=18' \
  --header 'x-rapidapi-host: bhagavad-gita3.p.rapidapi.com' \
  --header 'x-rapidapi-key: YOUR_API_KEY'
```

#### 2. Get Specific Chapter

```bash
curl --request GET \
  --url 'https://bhagavad-gita3.p.rapidapi.com/v2/chapters/1/' \
  --header 'x-rapidapi-host: bhagavad-gita3.p.rapidapi.com' \
  --header 'x-rapidapi-key: YOUR_API_KEY'
```

### **Prepared for Future APIs**

- ✅ `/chapters/{id}/verses` - Get all verses of a chapter
- ✅ `/chapters/{chapter}/verses/{verse}` - Get specific verse
- ✅ Store structure ready for real verse data
- ✅ Loading and error states implemented

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ or Bun runtime
- Modern web browser

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/ankittchauhann/Bhagwat-Gita.git
   cd Bhagwat-Gita
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure API Key**
   - Open `src/store/gitaStore.ts`
   - Replace `API_KEY` with your RapidAPI key

   ```typescript
   const API_KEY = "your-rapidapi-key-here"
   ```

4. **Start development server**

   ```bash
   bun run dev
   ```

   The app will be available at `http://localhost:3000` (or next available port)

5. **Build for production**

   ```bash
   bun run build
   ```

6. **Preview production build**

   ```bash
   bun run serve
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # ShadCN UI components
│   │   ├── button.tsx         # Reusable button component
│   │   ├── card.tsx           # Card components for content
│   │   └── input.tsx          # Input components
│   ├── Dashboard.tsx          # Beautiful home page
│   ├── ChaptersPage.tsx       # All chapters view with search
│   └── ChapterPage.tsx        # Individual chapter with verses
├── store/
│   └── gitaStore.ts           # Zustand state management
├── lib/
│   └── utils.ts               # Utility functions (cn helper)
├── routes/                    # TanStack Router file-based routing
│   ├── __root.tsx             # Root layout component
│   ├── index.tsx              # Dashboard route (/)
│   ├── chapters.tsx           # Chapters listing (/chapters)
│   └── chapter.$chapterId.tsx # Dynamic chapter route
└── styles.css                # Global styles with Sanskrit fonts
```

## 🧭 Navigation Flow

```
Dashboard (/) 
    ↓ "Namaste" button
Chapters Page (/chapters)
    ↓ Click any chapter
Chapter Detail (/chapter/{id})
    ↓ Browse verses in sidebar
Individual Verses (with API integration ready)
```

## 📊 State Management

The app uses Zustand for efficient state management:

```typescript
interface GitaState {
  // Data
  chapters: Chapter[]
  currentChapter: Chapter | null
  verses: Verse[]
  currentVerse: Verse | null
  
  // UI State
  loading: boolean
  error: string | null
  
  // API Actions
  fetchChapters: () => Promise<void>
  fetchChapter: (id: number) => Promise<void>
  fetchVerses: (chapterId: number) => Promise<void>
  fetchVerse: (chapterId: number, verse: number) => Promise<void>
}
```

## 🎨 Design Philosophy

### **Color Palette**

- **Primary**: Warm oranges (`#ea580c`, `#f97316`)
- **Secondary**: Deep reds (`#dc2626`, `#ef4444`)
- **Accent**: Golden yellows (`#eab308`, `#f59e0b`)
- **Neutral**: Sophisticated grays (`#64748b`, `#475569`)

### **Typography**

- **Sanskrit**: Noto Sans Devanagari, Mangal, Kokila
- **English**: Inter, system fonts for readability
- **Hierarchy**: Clear font sizes and weights for content scanning

### **Visual Elements**

- **Gradients**: Subtle transitions for depth
- **Shadows**: Soft elevations for modern feel
- **Border Radius**: Consistent rounded corners
- **Spacing**: Harmonious padding and margins

## 🔧 Available Scripts

```bash
# Development
bun run dev          # Start dev server with hot reload
bun run build        # Build for production
bun run serve        # Preview production build

# Code Quality  
bun run lint         # Run Biome linter
bun run format       # Format code with Biome
bun run check        # Run both lint and format

# Testing (when implemented)
bun run test         # Run test suite
```

## 🚧 Roadmap & Future Enhancements

### **Phase 1: Core Features** ✅

- [x] Beautiful dashboard with spiritual design
- [x] All chapters API integration
- [x] Individual chapter API integration
- [x] Search functionality
- [x] Responsive design
- [x] Sanskrit font support

### **Phase 2: Verses Integration** (Ready for APIs)

- [ ] All verses API integration
- [ ] Individual verse API integration  
- [ ] Word-by-word meanings
- [ ] Commentary from different authors

### **Phase 3: Enhanced Experience**

- [ ] Audio playback for Sanskrit recitation
- [ ] Bookmarking favorite verses
- [ ] Daily verse notifications
- [ ] Dark mode support
- [ ] Offline support with service workers

### **Phase 4: Advanced Features**

- [ ] Multi-language support (Hindi, Telugu, Tamil)
- [ ] Verse-by-verse search
- [ ] Commentary comparison
- [ ] Reading progress tracking
- [ ] Social sharing capabilities

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines**

- Follow TypeScript best practices
- Use Biome for consistent formatting
- Write meaningful commit messages
- Test your changes across different screen sizes
- Ensure accessibility standards are met

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bhagavad Gita API** by RapidAPI for authentic content
- **ShadCN** for beautiful, accessible UI components
- **Tailwind CSS** for utility-first styling approach
- **TanStack Router** for excellent routing solution
- **The timeless wisdom of the Bhagavad Gita** for spiritual guidance

---

## 🕉️ About the Bhagavad Gita

The Bhagavad Gita is a 700-verse Sanskrit scripture that is part of the ancient Indian epic Mahabharata. It is a conversation between Prince Arjuna and Lord Krishna, who serves as his charioteer, at the start of the Kurukshetra War.

**Core Themes:**

- **Dharma** (righteous duty)
- **Karma** (action and consequences)  
- **Moksha** (liberation/salvation)
- **Bhakti** (devotion)

This app aims to make these timeless teachings accessible to modern readers while preserving the spiritual essence and authenticity of the original text.

---

**श्रीमद्भगवद्गीता किजय हो** - "Victory to the Divine Song"

*May this app illuminate your path to spiritual wisdom* 🙏✨

First add your dependencies:

```bash
bun install @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
bun install @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
