# Phase 2 Quick Reference

## Component Usage Guide

### Layout Components

#### Header
```tsx
import { Header } from '@/components/layouts/Header';

// Already integrated in app/[locale]/layout.tsx
// Includes: Navigation, Logo, Language Switcher, Accessibility Controls
```

#### Footer
```tsx
import { Footer } from '@/components/layouts/Footer';

// Already integrated in app/[locale]/layout.tsx
// Includes: Links, Contact Info, Social Media
```

### Loading States

#### Skeleton Components
```tsx
import { CardSkeleton, ListSkeleton, PageSkeleton } from '@/components/loading/CardSkeleton';

// Card placeholder
<CardSkeleton />

// List placeholder (3 items)
<ListSkeleton items={3} />

// Table placeholder
<TableSkeleton rows={5} columns={4} />

// Full page placeholder
<PageSkeleton />
```

### Notifications

#### Toast
```tsx
import { useToast } from '@/components/ui/use-toast';

const { toast } = useToast();

// Success toast
toast({
  title: 'Success',
  description: 'Your changes have been saved',
  variant: 'success',
});

// Error toast
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'error',
});

// With action
toast({
  title: 'Appointment Reminder',
  description: 'You have an appointment tomorrow',
  action: <Button onClick={handleView}>View</Button>,
});
```

### Form Components

#### Input
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email</Label>
<Input
  id="email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
/>
```

#### Select
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox
```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">I agree to terms</Label>
</div>
```

### Modal/Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Accessibility Components

#### Screen Reader Only
```tsx
import { ScreenReaderOnly } from '@/components/accessibility/ScreenReaderOnly';

<ScreenReaderOnly>
  This text is only for screen readers
</ScreenReaderOnly>
```

#### Live Region (Announcements)
```tsx
import { useAnnounce } from '@/components/accessibility/LiveRegion';

const { announce, LiveRegionComponent } = useAnnounce();

// Announce a message
announce('Form submitted successfully');

// Add component to your JSX
<LiveRegionComponent />
```

#### Focus Trap (for Modals)
```tsx
import { FocusTrap } from '@/components/accessibility/FocusTrap';

<FocusTrap active={isModalOpen}>
  <div>Modal content</div>
</FocusTrap>
```

#### Skip Link
```tsx
import { SkipLink } from '@/components/accessibility/SkipLink';

<SkipLink href="#main-content">
  Skip to main content
</SkipLink>
```

### Performance Components

#### Lazy Image
```tsx
import { LazyImage } from '@/components/performance/LazyImage';

<LazyImage
  src="/images/photo.jpg"
  alt="Description"
  width={600}
  height={400}
  fallback={<div>Failed to load</div>}
/>
```

#### Lazy Load Component
```tsx
import { LazyLoad } from '@/components/performance/LazyLoad';

<LazyLoad fallback={<Skeleton className="h-32" />}>
  <HeavyComponent />
</LazyLoad>
```

### Performance Utilities

```tsx
import {
  debounce,
  throttle,
  isSlowConnection,
} from '@/lib/performance';

// Debounce search input
const debouncedSearch = debounce((query) => {
  // Search logic
}, 300);

// Throttle scroll handler
const throttledScroll = throttle(() => {
  // Scroll logic
}, 100);

// Check connection
if (isSlowConnection()) {
  // Load lower quality images
}
```

### Error Handling

#### Error Boundary
```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

<ErrorBoundary
  fallback={<div>Something went wrong</div>}
  onError={(error, errorInfo) => {
    // Log to error service
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Design Tokens Usage

```tsx
import { colors, spacing, typography } from '@/lib/design-tokens';

// Use in styles
const customStyle = {
  color: colors.primary[500],
  padding: spacing[4],
  fontSize: typography.fontSize.lg,
};

// Or use Tailwind classes
<div className="text-primary-500 p-4 text-lg">
  Content
</div>
```

## Common Patterns

### Form with Validation
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function MyForm() {
  const { toast } = useToast();
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit logic
      toast({
        title: 'Success',
        description: 'Form submitted',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            error={errors.name}
            required
          />
        </div>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
```

### Loading State
```tsx
import { CardSkeleton } from '@/components/loading/CardSkeleton';

function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  if (loading) return <CardSkeleton />;
  
  return <div>{/* Render data */}</div>;
}
```

### Confirmation Dialog
```tsx
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function DeleteConfirmation({ open, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Accessibility Checklist

When creating new components:

- [ ] Proper semantic HTML (`<nav>`, `<main>`, `<button>`, etc.)
- [ ] ARIA labels where needed
- [ ] Keyboard accessible (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Works with screen readers
- [ ] Respects reduced motion preference

## Testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:e2e -- accessibility.spec.ts
```

## Common Issues

### Modal not closing
- Ensure you're handling `onOpenChange` prop
- Check that Escape key handler is working

### Focus not trapping in modal
- Wrap content in `<FocusTrap>` component
- Ensure focusable elements exist inside

### Toast not showing
- Add `<Toaster />` to your layout
- Import `useToast` hook correctly

### Form validation not working
- Pass `error` prop to Input components
- Associate error messages with inputs using `id`

---

**Quick Tip:** All components are fully documented with TypeScript types. Use your IDE's autocomplete for available props!

