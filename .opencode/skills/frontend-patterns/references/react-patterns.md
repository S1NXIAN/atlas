# React Frontend Patterns

## Container/Presenter Pattern

```tsx
// Container: handles data fetching and state
function UserProfileContainer() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorFallback error={error} />
  return <UserProfilePresenter user={user} />
}

// Presenter: renders props, no data fetching
function UserProfilePresenter({ user }: { user: User }) {
  return <div>{user.name}</div>
}
```

## Data Fetching with React Query

```tsx
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/v1/users').then(r => r.json()),
    staleTime: 30_000,    // 30s before refetch
    retry: 2,             // retry twice on failure
  })
}
```

## Optimistic Update with Rollback

```tsx
const mutation = useMutation({
  mutationFn: (id: string) => deleteUser(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['users'] })
    const previous = queryClient.getQueryData(['users'])
    queryClient.setQueryData(['users'], (old) => old.filter(u => u.id !== id))
    return { previous }
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['users'], context.previous)
  },
})
```

## Debounced Input

```tsx
function SearchInput() {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    if (debouncedValue) search(debouncedValue)
  }, [debouncedValue])

  return <input value={value} onChange={e => setValue(e.target.value)} />
}
```

## Error Boundary

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    logErrorToMonitoring(error, info)
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false })} />
    }
    return this.props.children
  }
}
```

## Route-Level Code Splitting

```tsx
const SettingsPage = lazy(() => import('./pages/Settings'))

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/settings" element={<SettingsPage />} />
  </Routes>
</Suspense>
```
