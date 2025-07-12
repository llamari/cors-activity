import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateRoom } from "./Pages/CreateRoom";
import { Room } from "./Pages/Room";

const queryClient = new QueryClient()

export function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<CreateRoom />} path="/" />
          <Route element={<Room />} path="/room/:id" />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
