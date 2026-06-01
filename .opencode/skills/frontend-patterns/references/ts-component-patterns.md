# TypeScript Component Patterns

## Props Typing with Discriminated Unions

```typescript
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

type NotificationProps = {
  variant: 'success' | 'error' | 'warning' | 'info'
  message: string
  onDismiss?: () => void
}
```

## Generic Component Pattern

```typescript
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  emptyState?: React.ReactNode
}

function List<T>({ items, renderItem, keyExtractor, emptyState }: ListProps<T>) {
  if (items.length === 0) return emptyState ?? <EmptyState />
  return items.map((item, index) => <li key={keyExtractor(item)}>{renderItem(item, index)}</li>)
}
```

## ForwardRef Pattern

```typescript
type InputProps = {
  label: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} aria-invalid={!!error} aria-describedby={error ? `${props.id}-error` : undefined} {...props} />
      {error && <span id={`${props.id}-error`} role="alert">{error}</span>}
    </div>
  )
)
```

## Anti-Patterns to Avoid

- **any props** — Never use `any` for component props. Use `unknown` if you must, then narrow.
- **Prop drilling beyond 3 levels** — Extract context or composition. Beyond 3 levels of prop passing, use context or component composition (children/slots).
- **Inline object/array in render** — Creates new reference every render. Extract to const outside component or use `useMemo`.
- **Spreading props without control** — `{...props}` spreads unknown props. Type them explicitly.
