/**
 * Seed Script - Populate database with sample content
 * 
 * Run with: npx tsx scripts/seed.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aadityahasabnis:Password123@personal-site.mkduq9g.mongodb.net/portfolio?appName=personal-site';
const DB_NAME = 'portfolio';

// ===== TOPICS =====
const SAMPLE_TOPICS = [
    {
        slug: 'dsa',
        title: 'Data Structures & Algorithms',
        description: 'Master the fundamentals of computer science with comprehensive tutorials on data structures, algorithms, and problem-solving patterns.',
        icon: 'Code',
        order: 0,
        published: true,
        featured: true,
        metadata: {
            articleCount: 4,
            lastUpdated: new Date(),
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
    },
    {
        slug: 'web-development',
        title: 'Web Development',
        description: 'Modern web development tutorials covering React, Next.js, TypeScript, and full-stack development best practices.',
        icon: 'Globe',
        order: 1,
        published: true,
        featured: true,
        metadata: {
            articleCount: 3,
            lastUpdated: new Date(),
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
    },
    {
        slug: 'devops',
        title: 'DevOps & Infrastructure',
        description: 'Learn about CI/CD pipelines, containerization, cloud infrastructure, and deployment strategies for modern applications.',
        icon: 'Server',
        order: 2,
        published: true,
        featured: false,
        metadata: {
            articleCount: 2,
            lastUpdated: new Date(),
        },
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date(),
    },
    {
        slug: 'system-design',
        title: 'System Design',
        description: 'Architecture patterns, scalability principles, and design decisions for building robust distributed systems.',
        icon: 'Network',
        order: 3,
        published: true,
        featured: false,
        metadata: {
            articleCount: 2,
            lastUpdated: new Date(),
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date(),
    },
];

// ===== SUBTOPICS =====
const SAMPLE_SUBTOPICS = [
    // DSA Subtopics
    {
        topicSlug: 'dsa',
        slug: 'fundamentals',
        title: 'DSA Fundamentals',
        description: 'Core concepts and foundational knowledge for DSA',
        order: 0,
        published: true,
        metadata: { articleCount: 2 },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
    },
    {
        topicSlug: 'dsa',
        slug: 'problem-solving',
        title: 'Problem Solving Patterns',
        description: 'Common patterns and techniques for solving algorithmic problems',
        order: 1,
        published: true,
        metadata: { articleCount: 2 },
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date(),
    },
    // Web Development Subtopics
    {
        topicSlug: 'web-development',
        slug: 'react',
        title: 'React',
        description: 'React patterns, hooks, and best practices',
        order: 0,
        published: true,
        metadata: { articleCount: 2 },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
    },
    {
        topicSlug: 'web-development',
        slug: 'nextjs',
        title: 'Next.js',
        description: 'Building production-ready applications with Next.js',
        order: 1,
        published: true,
        metadata: { articleCount: 1 },
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date(),
    },
    // DevOps Subtopics
    {
        topicSlug: 'devops',
        slug: 'docker',
        title: 'Docker & Containers',
        description: 'Containerization with Docker and container orchestration',
        order: 0,
        published: true,
        metadata: { articleCount: 1 },
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date(),
    },
    {
        topicSlug: 'devops',
        slug: 'ci-cd',
        title: 'CI/CD Pipelines',
        description: 'Continuous integration and deployment automation',
        order: 1,
        published: true,
        metadata: { articleCount: 1 },
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date(),
    },
    // System Design Subtopics
    {
        topicSlug: 'system-design',
        slug: 'fundamentals',
        title: 'Design Fundamentals',
        description: 'Core principles of system design',
        order: 0,
        published: true,
        metadata: { articleCount: 2 },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date(),
    },
];

// ===== TOPIC-BASED ARTICLES =====
const SAMPLE_TOPIC_ARTICLES = [
    // DSA - Fundamentals
    {
        type: 'article',
        topicSlug: 'dsa',
        subtopicSlug: 'fundamentals',
        slug: 'big-o-notation-explained',
        title: 'Big O Notation Explained',
        description: 'Understanding time and space complexity analysis with practical examples.',
        body: `# Big O Notation Explained

Big O notation is a mathematical notation that describes the limiting behavior of a function. In computer science, we use it to classify algorithms according to how their run time or space requirements grow as the input size grows.

## Why Does It Matter?

Understanding Big O helps you:
- **Compare algorithms** objectively
- **Predict performance** at scale
- **Make informed decisions** about data structure choices

## Common Complexities

### O(1) - Constant Time
\`\`\`javascript
function getFirst(arr) {
  return arr[0]; // Always one operation
}
\`\`\`

### O(n) - Linear Time
\`\`\`javascript
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}
\`\`\`

### O(n²) - Quadratic Time
\`\`\`javascript
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
\`\`\`

### O(log n) - Logarithmic Time
\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
\`\`\`

## Conclusion

Master Big O notation early - it's the foundation for all algorithm analysis.`,
        tags: ['DSA', 'Algorithms', 'Complexity'],
        published: true,
        featured: true,
        order: 0,
        readingTime: 6,
        publishedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        type: 'article',
        topicSlug: 'dsa',
        subtopicSlug: 'fundamentals',
        slug: 'arrays-and-strings',
        title: 'Arrays and Strings: The Foundation',
        description: 'Deep dive into array and string manipulation techniques every developer should know.',
        body: `# Arrays and Strings: The Foundation

Arrays and strings are the most fundamental data structures. Mastering them is essential for technical interviews and everyday programming.

## Array Fundamentals

### Key Operations
- Access: O(1)
- Search: O(n)
- Insert at end: O(1) amortized
- Insert at index: O(n)

### Common Patterns

#### Two Pointers
\`\`\`javascript
function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}
\`\`\`

#### Sliding Window
\`\`\`javascript
function maxSum(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  
  let maxSum = sum;
  for (let i = k; i < arr.length; i++) {
    sum = sum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, sum);
  }
  return maxSum;
}
\`\`\`

## String Manipulation

### Essential Methods
\`\`\`javascript
const s = "hello world";
s.split(' ');        // ['hello', 'world']
s.substring(0, 5);   // 'hello'
s.includes('world'); // true
s.indexOf('o');      // 4
\`\`\`

## Practice Problems
1. Reverse a string in-place
2. Find all anagrams in a string
3. Longest substring without repeating characters

Master these patterns and you'll handle 80% of array/string problems.`,
        tags: ['DSA', 'Arrays', 'Strings'],
        published: true,
        featured: false,
        order: 1,
        readingTime: 5,
        publishedAt: new Date('2024-01-18'),
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-18'),
    },
    // DSA - Problem Solving
    {
        type: 'article',
        topicSlug: 'dsa',
        subtopicSlug: 'problem-solving',
        slug: 'two-pointer-technique',
        title: 'Mastering the Two Pointer Technique',
        description: 'Learn when and how to use the two pointer pattern to solve array problems efficiently.',
        body: `# Mastering the Two Pointer Technique

The two pointer technique is a pattern that uses two pointers to iterate through a data structure. It's incredibly versatile and efficient.

## When to Use Two Pointers

- Sorted arrays
- Finding pairs with specific conditions
- In-place array modifications
- Palindrome problems

## Pattern Variations

### Opposite Direction
\`\`\`javascript
function twoSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}
\`\`\`

### Same Direction (Fast/Slow)
\`\`\`javascript
function removeDuplicates(arr) {
  if (arr.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++;
      arr[slow] = arr[fast];
    }
  }
  return slow + 1;
}
\`\`\`

## Classic Problems

1. **Container With Most Water** - Opposite direction
2. **Remove Duplicates** - Same direction
3. **Three Sum** - Two pointers + iteration

Practice these patterns until they become second nature!`,
        tags: ['DSA', 'Patterns', 'Algorithms'],
        published: true,
        featured: false,
        order: 0,
        readingTime: 5,
        publishedAt: new Date('2024-01-22'),
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
    },
    {
        type: 'article',
        topicSlug: 'dsa',
        subtopicSlug: 'problem-solving',
        slug: 'sliding-window-pattern',
        title: 'Sliding Window Pattern Deep Dive',
        description: 'Master the sliding window technique for solving subarray and substring problems.',
        body: `# Sliding Window Pattern Deep Dive

The sliding window pattern is used for problems involving contiguous sequences (subarrays or substrings).

## Types of Sliding Windows

### Fixed Size Window
\`\`\`javascript
function maxSumSubarray(arr, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
\`\`\`

### Dynamic Size Window
\`\`\`javascript
function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, minLen = Infinity;
  
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  
  return minLen === Infinity ? 0 : minLen;
}
\`\`\`

## When to Use

- Maximum/minimum sum of k elements
- Longest/shortest substring with condition
- Count of subarrays meeting criteria

The key insight: instead of recalculating, we slide!`,
        tags: ['DSA', 'Patterns', 'Algorithms'],
        published: true,
        featured: false,
        order: 1,
        readingTime: 6,
        publishedAt: new Date('2024-01-25'),
        createdAt: new Date('2024-01-23'),
        updatedAt: new Date('2024-01-25'),
    },
    // Web Development - React
    {
        type: 'article',
        topicSlug: 'web-development',
        subtopicSlug: 'react',
        slug: 'react-hooks-deep-dive',
        title: 'React Hooks: A Complete Deep Dive',
        description: 'Understanding React hooks from basics to advanced patterns with practical examples.',
        body: `# React Hooks: A Complete Deep Dive

Hooks revolutionized React development. Let's explore them from basics to advanced patterns.

## Essential Hooks

### useState
\`\`\`tsx
const [count, setCount] = useState(0);

// Functional update
setCount(prev => prev + 1);
\`\`\`

### useEffect
\`\`\`tsx
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, [dependency]);
\`\`\`

### useCallback & useMemo
\`\`\`tsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

const memoizedValue = useMemo(() => computeExpensive(a), [a]);
\`\`\`

## Custom Hooks

\`\`\`tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
\`\`\`

## Best Practices

1. **Keep hooks at the top level** - Never inside conditions
2. **Use the dependency array correctly** - Include all dependencies
3. **Extract logic into custom hooks** - Reuse and test

Hooks make functional components powerful and composable!`,
        tags: ['React', 'Hooks', 'JavaScript'],
        published: true,
        featured: true,
        order: 0,
        readingTime: 7,
        publishedAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-20'),
    },
    {
        type: 'article',
        topicSlug: 'web-development',
        subtopicSlug: 'react',
        slug: 'react-server-components',
        title: 'Understanding React Server Components',
        description: 'A complete guide to React Server Components and the new mental model for React.',
        body: `# Understanding React Server Components

React Server Components (RSC) represent a paradigm shift in how we build React applications.

## The Core Concept

Server Components run only on the server:
- Zero client-side JavaScript
- Direct database access
- Automatic code splitting

## Server vs Client

\`\`\`tsx
// Server Component (default)
async function ArticleList() {
  const articles = await db.articles.findMany();
  return (
    <ul>
      {articles.map(a => <li key={a.id}>{a.title}</li>)}
    </ul>
  );
}

// Client Component
'use client';
function LikeButton({ id }) {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
\`\`\`

## Composition Patterns

\`\`\`tsx
// Server Component with Client island
function Article({ article }) {
  return (
    <article>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
      {/* Client island */}
      <LikeButton id={article.id} />
    </article>
  );
}
\`\`\`

## Benefits

1. **Smaller bundles** - Server-only code doesn't ship
2. **Better SEO** - Full HTML on first paint
3. **Simpler data fetching** - No useEffect waterfall

Embrace the new model - it's the future of React!`,
        tags: ['React', 'Next.js', 'Server Components'],
        published: true,
        featured: true,
        order: 1,
        readingTime: 6,
        publishedAt: new Date('2024-01-25'),
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-25'),
    },
    // Web Development - Next.js
    {
        type: 'article',
        topicSlug: 'web-development',
        subtopicSlug: 'nextjs',
        slug: 'nextjs-app-router-guide',
        title: 'Next.js App Router: Complete Guide',
        description: 'Everything you need to know about the Next.js App Router and its powerful features.',
        body: `# Next.js App Router: Complete Guide

The App Router is Next.js's new paradigm for building React applications with server-first rendering.

## File-Based Routing

\`\`\`
app/
  page.tsx           # /
  about/page.tsx     # /about
  blog/[slug]/page.tsx  # /blog/:slug
  (auth)/login/page.tsx # /login (grouped)
\`\`\`

## Layouts

\`\`\`tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
\`\`\`

## Data Fetching

\`\`\`tsx
// Server Component - direct fetch
async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data.title}</div>;
}

// With revalidation
export const revalidate = 3600; // Revalidate every hour
\`\`\`

## Server Actions

\`\`\`tsx
'use server';

async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ title });
  revalidatePath('/posts');
}
\`\`\`

## Streaming & Suspense

\`\`\`tsx
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
\`\`\`

The App Router makes full-stack React development simple and performant!`,
        tags: ['Next.js', 'React', 'App Router'],
        published: true,
        featured: true,
        order: 0,
        readingTime: 8,
        publishedAt: new Date('2024-01-28'),
        createdAt: new Date('2024-01-26'),
        updatedAt: new Date('2024-01-28'),
    },
    // DevOps - Docker
    {
        type: 'article',
        topicSlug: 'devops',
        subtopicSlug: 'docker',
        slug: 'docker-for-developers',
        title: 'Docker for Developers: A Practical Guide',
        description: 'Learn Docker fundamentals and how to containerize your applications effectively.',
        body: `# Docker for Developers: A Practical Guide

Docker makes it easy to package and run applications in isolated containers.

## Key Concepts

- **Image**: Blueprint for containers
- **Container**: Running instance of an image
- **Dockerfile**: Instructions to build an image

## Basic Dockerfile

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Essential Commands

\`\`\`bash
# Build an image
docker build -t myapp .

# Run a container
docker run -p 3000:3000 myapp

# List containers
docker ps

# Stop a container
docker stop <container-id>
\`\`\`

## Docker Compose

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
\`\`\`

Start with Docker locally, then scale to production!`,
        tags: ['Docker', 'DevOps', 'Containers'],
        published: true,
        featured: false,
        order: 0,
        readingTime: 6,
        publishedAt: new Date('2024-01-30'),
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-01-30'),
    },
    // DevOps - CI/CD
    {
        type: 'article',
        topicSlug: 'devops',
        subtopicSlug: 'ci-cd',
        slug: 'github-actions-guide',
        title: 'GitHub Actions: Automate Everything',
        description: 'Set up CI/CD pipelines with GitHub Actions for testing, building, and deploying.',
        body: `# GitHub Actions: Automate Everything

GitHub Actions lets you automate your software development workflows directly in your repository.

## Basic Workflow

\`\`\`yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
\`\`\`

## Matrix Builds

\`\`\`yaml
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]
\`\`\`

## Deploy to Vercel

\`\`\`yaml
deploy:
  needs: test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.ORG_ID }}
        vercel-project-id: \${{ secrets.PROJECT_ID }}
\`\`\`

## Best Practices

1. Cache dependencies for faster builds
2. Use secrets for sensitive data
3. Run tests before deployment

Automate early and often!`,
        tags: ['GitHub Actions', 'CI/CD', 'DevOps'],
        published: true,
        featured: false,
        order: 0,
        readingTime: 5,
        publishedAt: new Date('2024-02-01'),
        createdAt: new Date('2024-01-30'),
        updatedAt: new Date('2024-02-01'),
    },
    // System Design - Fundamentals
    {
        type: 'article',
        topicSlug: 'system-design',
        subtopicSlug: 'fundamentals',
        slug: 'caching-strategies',
        title: 'Caching Strategies for Web Applications',
        description: 'Learn different caching strategies and when to use them in your applications.',
        body: `# Caching Strategies for Web Applications

Caching is one of the most effective ways to improve application performance.

## Cache Layers

1. **Browser Cache** - Client-side
2. **CDN Cache** - Edge network
3. **Application Cache** - Redis/Memcached
4. **Database Cache** - Query cache

## Common Strategies

### Cache-Aside (Lazy Loading)
\`\`\`typescript
async function getData(key: string) {
  let data = await cache.get(key);
  if (!data) {
    data = await db.query(key);
    await cache.set(key, data, { ttl: 3600 });
  }
  return data;
}
\`\`\`

### Write-Through
\`\`\`typescript
async function saveData(key: string, data: any) {
  await db.save(key, data);
  await cache.set(key, data);
}
\`\`\`

### Write-Behind (Write-Back)
- Queue writes to cache
- Async flush to database

## Invalidation Strategies

1. **TTL (Time To Live)** - Expire after time
2. **Event-based** - Invalidate on write
3. **LRU (Least Recently Used)** - Evict old entries

## Key Decisions

- What to cache?
- How long to cache?
- When to invalidate?

Cache wisely - it's not just about speed, it's about consistency!`,
        tags: ['System Design', 'Caching', 'Performance'],
        published: true,
        featured: false,
        order: 0,
        readingTime: 6,
        publishedAt: new Date('2024-02-03'),
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-03'),
    },
    {
        type: 'article',
        topicSlug: 'system-design',
        subtopicSlug: 'fundamentals',
        slug: 'database-scaling',
        title: 'Database Scaling: From Zero to Millions',
        description: 'Strategies for scaling databases as your application grows.',
        body: `# Database Scaling: From Zero to Millions

As your application grows, your database strategy must evolve.

## Scaling Strategies

### Vertical Scaling (Scale Up)
- Add more CPU/RAM
- Simple but limited
- Good for: < 100K users

### Horizontal Scaling (Scale Out)
- Add more machines
- Complex but unlimited
- Good for: 100K+ users

## Read Scaling

\`\`\`
Primary DB (writes) 
    ├── Replica 1 (reads)
    ├── Replica 2 (reads)
    └── Replica 3 (reads)
\`\`\`

## Write Scaling: Sharding

\`\`\`typescript
function getShard(userId: string) {
  const hash = hashFunction(userId);
  return hash % NUM_SHARDS;
}
\`\`\`

## Common Patterns

### Connection Pooling
\`\`\`typescript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});
\`\`\`

### Read Replicas
- Route reads to replicas
- Route writes to primary
- Handle replication lag

## When to Scale

1. Response time increasing
2. CPU/Memory > 70%
3. Connection limits hit

Scale before you need to - reactive scaling is expensive!`,
        tags: ['System Design', 'Database', 'Scaling'],
        published: true,
        featured: false,
        order: 1,
        readingTime: 7,
        publishedAt: new Date('2024-02-05'),
        createdAt: new Date('2024-02-03'),
        updatedAt: new Date('2024-02-05'),
    },
];

// Sample Notes (unchanged from original)
const SAMPLE_NOTES = [
    {
        type: 'note',
        slug: 'til-css-has-selector',
        title: 'TIL: The CSS :has() Selector',
        description: 'Finally, a parent selector in CSS! The :has() pseudo-class lets you style elements based on their children.',
        body: `The \`:has()\` selector is a game-changer for CSS:

\`\`\`css
/* Style a card that contains an image */
.card:has(img) {
  padding: 0;
}

/* Style a form with invalid inputs */
form:has(:invalid) {
  border-color: red;
}
\`\`\`

Browser support is now excellent across all modern browsers.`,
        tags: ['CSS', 'TIL'],
        published: true,
        publishedAt: new Date('2024-01-28'),
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-01-28'),
    },
    {
        type: 'note',
        slug: 'git-amend-without-editing',
        title: 'Git: Amend Without Editing Message',
        description: 'Quick tip for amending the last commit without changing the commit message.',
        body: `To add changes to the last commit without editing the message:

\`\`\`bash
git commit --amend --no-edit
\`\`\`

Useful when you forgot to add a file or made a quick fix.`,
        tags: ['Git', 'CLI', 'TIL'],
        published: true,
        publishedAt: new Date('2024-01-26'),
        createdAt: new Date('2024-01-26'),
        updatedAt: new Date('2024-01-26'),
    },
    {
        type: 'note',
        slug: 'typescript-satisfies-operator',
        title: 'TypeScript: The satisfies Operator',
        description: 'Using satisfies for better type inference while still validating types.',
        body: `The \`satisfies\` operator validates a type without widening it:

\`\`\`typescript
const config = {
  port: 3000,
  host: 'localhost'
} satisfies Record<string, string | number>;

// config.port is number, not string | number!
\`\`\`

This gives you both validation AND precise inference.`,
        tags: ['TypeScript', 'TIL'],
        published: true,
        publishedAt: new Date('2024-01-24'),
        createdAt: new Date('2024-01-24'),
        updatedAt: new Date('2024-01-24'),
    },
];

// Article Stats for topic-based articles
const SAMPLE_ARTICLE_STATS = [
    { slug: 'dsa/big-o-notation-explained', views: 1547, likes: 98, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'dsa/arrays-and-strings', views: 892, likes: 67, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'dsa/two-pointer-technique', views: 734, likes: 52, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'dsa/sliding-window-pattern', views: 621, likes: 45, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'web-development/react-hooks-deep-dive', views: 1823, likes: 134, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'web-development/react-server-components', views: 2145, likes: 156, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'web-development/nextjs-app-router-guide', views: 1567, likes: 112, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'devops/docker-for-developers', views: 987, likes: 76, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'devops/github-actions-guide', views: 756, likes: 58, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'system-design/caching-strategies', views: 534, likes: 42, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'system-design/database-scaling', views: 478, likes: 38, createdAt: new Date(), updatedAt: new Date() },
];

// Page Stats for notes
const SAMPLE_PAGE_STATS = [
    { slug: 'til-css-has-selector', views: 234, likes: 23, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'git-amend-without-editing', views: 189, likes: 15, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'typescript-satisfies-operator', views: 312, likes: 28, createdAt: new Date(), updatedAt: new Date() },
];

// Sample Projects (unchanged from original)
const SAMPLE_PROJECTS = [
    {
        slug: 'personal-website',
        title: 'Personal Website',
        description: 'A fast, minimal, SEO-first personal knowledge system built with Next.js, MongoDB, and Tailwind CSS.',
        longDescription: 'This website showcases my work and writing. Built with Next.js 16 App Router, featuring Server Components, ISR, and streaming for optimal performance.',
        tags: ['Next.js', 'TypeScript', 'MongoDB', 'Tailwind CSS'],
        github: 'https://github.com/aadityahasabnis/portfolio',
        live: 'https://aadityahasabnis.site',
        featured: true,
        status: 'active',
        order: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-30'),
    },
    {
        slug: 'react-component-library',
        title: 'React Component Library',
        description: 'A collection of reusable, accessible React components with TypeScript support and Storybook documentation.',
        longDescription: 'Built with accessibility in mind, this component library provides a solid foundation for React applications.',
        tags: ['React', 'TypeScript', 'Storybook', 'Accessibility'],
        github: 'https://github.com/aadityahasabnis/react-components',
        featured: true,
        status: 'active',
        order: 2,
        createdAt: new Date('2023-08-15'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        slug: 'cli-productivity-tools',
        title: 'CLI Productivity Tools',
        description: 'A suite of command-line tools to automate repetitive development tasks and boost productivity.',
        tags: ['Node.js', 'CLI', 'Automation'],
        github: 'https://github.com/aadityahasabnis/cli-tools',
        featured: false,
        status: 'active',
        order: 3,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-12-01'),
    },
];

// Sample Comments
const SAMPLE_COMMENTS = [
    {
        articleSlug: 'dsa/big-o-notation-explained',
        author: { name: 'Alex Chen', email: 'alex@example.com' },
        content: 'Great explanation! The visual examples really helped me understand the differences between O(n) and O(log n).',
        approved: true,
        likes: 12,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
    },
    {
        articleSlug: 'dsa/big-o-notation-explained',
        author: { name: 'Sarah Johnson', email: 'sarah@example.com' },
        content: 'Could you add more examples for O(n!) factorial time complexity?',
        approved: true,
        likes: 5,
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
    },
    {
        articleSlug: 'web-development/react-hooks-deep-dive',
        author: { name: 'Mike Wilson', email: 'mike@example.com' },
        content: 'The custom hook example is exactly what I needed for my project. Thanks!',
        approved: true,
        likes: 8,
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date('2024-01-21'),
    },
];

async function seed() {
    console.log('🌱 Seeding database...\n');

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);

    try {
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await db.collection('content').deleteMany({});
        await db.collection('topics').deleteMany({});
        await db.collection('subtopics').deleteMany({});
        await db.collection('article_stats').deleteMany({});
        await db.collection('pageStats').deleteMany({});
        await db.collection('projects').deleteMany({});
        await db.collection('comments').deleteMany({});

        // Insert topics
        console.log('📂 Inserting topics...');
        await db.collection('topics').insertMany(SAMPLE_TOPICS);
        console.log(`   ✓ Inserted ${SAMPLE_TOPICS.length} topics`);

        // Insert subtopics
        console.log('📁 Inserting subtopics...');
        await db.collection('subtopics').insertMany(SAMPLE_SUBTOPICS);
        console.log(`   ✓ Inserted ${SAMPLE_SUBTOPICS.length} subtopics`);

        // Insert topic-based articles
        console.log('📝 Inserting topic articles...');
        await db.collection('content').insertMany(SAMPLE_TOPIC_ARTICLES);
        console.log(`   ✓ Inserted ${SAMPLE_TOPIC_ARTICLES.length} articles`);

        // Insert notes
        console.log('📌 Inserting notes...');
        await db.collection('content').insertMany(SAMPLE_NOTES);
        console.log(`   ✓ Inserted ${SAMPLE_NOTES.length} notes`);

        // Insert projects
        console.log('🚀 Inserting projects...');
        await db.collection('projects').insertMany(SAMPLE_PROJECTS);
        console.log(`   ✓ Inserted ${SAMPLE_PROJECTS.length} projects`);

        // Insert article stats
        console.log('📊 Inserting article stats...');
        await db.collection('article_stats').insertMany(SAMPLE_ARTICLE_STATS);
        console.log(`   ✓ Inserted ${SAMPLE_ARTICLE_STATS.length} article stats`);

        // Insert page stats (for notes)
        console.log('📈 Inserting page stats...');
        await db.collection('pageStats').insertMany(SAMPLE_PAGE_STATS);
        console.log(`   ✓ Inserted ${SAMPLE_PAGE_STATS.length} page stats`);

        // Insert comments
        console.log('💬 Inserting comments...');
        await db.collection('comments').insertMany(SAMPLE_COMMENTS);
        console.log(`   ✓ Inserted ${SAMPLE_COMMENTS.length} comments`);

        // Create indexes
        console.log('🔍 Creating indexes...');
        
        // Topics indexes
        await db.collection('topics').createIndex({ slug: 1 }, { unique: true });
        await db.collection('topics').createIndex({ published: 1, order: 1 });
        await db.collection('topics').createIndex({ featured: 1, order: 1 });
        
        // Subtopics indexes
        await db.collection('subtopics').createIndex({ topicSlug: 1, slug: 1 }, { unique: true });
        await db.collection('subtopics').createIndex({ topicSlug: 1, order: 1 });
        
        // Content indexes
        await db.collection('content').createIndex({ type: 1, slug: 1 });
        await db.collection('content').createIndex({ type: 1, topicSlug: 1, slug: 1 });
        await db.collection('content').createIndex({ type: 1, published: 1, publishedAt: -1 });
        await db.collection('content').createIndex({ type: 1, featured: 1 });
        await db.collection('content').createIndex({ topicSlug: 1, subtopicSlug: 1, order: 1 });
        await db.collection('content').createIndex({ tags: 1 });
        
        // Stats indexes
        await db.collection('article_stats').createIndex({ slug: 1 }, { unique: true });
        await db.collection('pageStats').createIndex({ slug: 1 }, { unique: true });
        
        // Projects indexes
        await db.collection('projects').createIndex({ slug: 1 }, { unique: true });
        await db.collection('projects').createIndex({ featured: 1, order: 1 });
        
        // Comments indexes
        await db.collection('comments').createIndex({ articleSlug: 1, approved: 1, createdAt: -1 });
        
        console.log('   ✓ Indexes created');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - ${SAMPLE_TOPICS.length} topics`);
        console.log(`   - ${SAMPLE_SUBTOPICS.length} subtopics`);
        console.log(`   - ${SAMPLE_TOPIC_ARTICLES.length} articles`);
        console.log(`   - ${SAMPLE_NOTES.length} notes`);
        console.log(`   - ${SAMPLE_PROJECTS.length} projects`);
        console.log(`   - ${SAMPLE_ARTICLE_STATS.length + SAMPLE_PAGE_STATS.length} stats records`);
        console.log(`   - ${SAMPLE_COMMENTS.length} comments`);
        console.log('\n🚀 You can now start the dev server: npm run dev');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        await client.close();
    }
}

seed().catch(console.error);
