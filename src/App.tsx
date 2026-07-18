import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./router/AppRouter";
import { useAuthListener } from "./hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

function AuthBootstrap() {
  useAuthListener();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
