import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Moon, Sun, Search, MessageCircleQuestion, Clock, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from "dayjs"
import 'dayjs/locale/pt-br'

type GetRoomsAPIResponse = Array<{
    id: string,
    name: string,
    description: string,
    questionsCount: number,
    createdAt: string
}>

export function CreateRoom() {
    const navigate = useNavigate();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newRoom, setNewRoom] = useState({
        name: "",
        description: "",
    })

    const { data, isLoading } = useQuery({
        queryKey: ['get-rooms'],
        queryFn: async () => {
            const response = (await fetch('http://localhost:3333/rooms'))
            const result: GetRoomsAPIResponse = await response.json()
            return result
        }
    })
    const [darkMode, setDarkMode] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredRooms = data?.filter(
        (room) =>
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    dayjs.extend(relativeTime);
    dayjs.locale('pt-br')

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
    }

    const createRoomMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('http://localhost:3333/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newRoom)
            })

            if (!response.ok) {
                throw new Error("Erro ao criar sala")
            }

            return response.json()
        },
        onSuccess: () => {
            setIsCreateDialogOpen(false)
            setNewRoom({ name: "", description: "" })
        },
        onError: () => {
            alert("Erro ao criar sala")
        }
    })

    async function AddRoom() {
        createRoomMutation.mutate()
    }

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${darkMode
                ? "bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white"
                : "bg-gradient-to-br from-white via-purple-300 to-purple-500 text-gray-900"
                }`}
        >

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Search Bar */}
                <div className="mb-8 flex">
                    <div className="relative max-w-md mx-auto flex-1">
                        <Search
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? "text-purple-300" : "text-purple-500"
                                }`}
                        />
                        <Input
                            type="text"
                            placeholder="Search rooms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`pl-10 transition-colors duration-300 ${darkMode
                                ? "bg-purple-800/50 border-purple-600 text-white placeholder:text-purple-300"
                                : "bg-white border-purple-200 placeholder:text-purple-400"
                                }`}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleDarkMode}
                        className={`transition-colors duration-300 mr-5 ${darkMode ? "border-purple-600 hover:bg-purple-800" : "border-purple-900 hover:bg-purple-900 hover:text-purple-950"
                            }`}
                    >
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span className="sr-only">Toggle dark mode</span>
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className={`transition-colors duration-300 ${darkMode
                                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                                    }`}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent
                            className={`sm:max-w-[425px] transition-colors duration-300 ${darkMode ? "bg-purple-900 border-purple-700" : "bg-white border-purple-200"
                                }`}
                        >
                            <DialogHeader>
                                <DialogTitle className={darkMode ? "text-white" : "text-gray-900"}>Create New Room</DialogTitle>
                                <DialogDescription className={darkMode ? "text-purple-200" : "text-purple-600"}>
                                    Create a new study room for others to join and learn together.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={() => AddRoom()}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="room-name"
                                            className={`text-sm font-medium ${darkMode ? "text-purple-200" : "text-purple-700"}`}
                                        >
                                            Room Name
                                        </Label>
                                        <Input
                                            id="room-name"
                                            value={newRoom.name}
                                            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                            placeholder="Enter room name..."
                                            className={`transition-colors duration-300 ${darkMode
                                                ? "bg-purple-800/50 border-purple-600 placeholder:text-purple-300 text-white"
                                                : "bg-white border-purple-200 placeholder:text-purple-400 text-black"
                                                }`}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="room-description"
                                            className={`text-sm font-medium ${darkMode ? "text-purple-200" : "text-purple-700"}`}
                                        >
                                            Description
                                        </Label>
                                        <Textarea
                                            id="room-description"
                                            value={newRoom.description}
                                            onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                                            placeholder="Describe what this room is about..."
                                            className={`min-h-[100px] transition-colors duration-300 ${darkMode
                                                ? "bg-purple-800/50 border-purple-600 text-white placeholder:text-purple-300"
                                                : "bg-white border-purple-200 text-black placeholder:text-purple-400"
                                                }`}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateDialogOpen(false)}
                                        className={`transition-colors duration-300 ${darkMode
                                            ? "border-purple-600 text-purple-200 hover:bg-purple-800"
                                            : "border-purple-300 text-purple-700 hover:bg-purple-100 hover:text-purple-900"
                                            }`}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className={`transition-colors duration-300 ${darkMode
                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                            : "bg-purple-600 hover:bg-purple-700 text-white"
                                            }`}
                                    >
                                        Create Room
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Room Grid */}
                {filteredRooms && filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map((room) => (
                            <Card
                                key={room.id}
                                className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${darkMode
                                    ? "bg-purple-800/30 border-purple-600 hover:bg-purple-800/50"
                                    : "bg-white border-purple-200 hover:shadow-purple-200/50"
                                    }`}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>{room.name}</CardTitle>
                                    </div>
                                    <CardDescription className={`${darkMode ? "text-purple-200" : "text-purple-600"}`}>
                                        {room.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <MessageCircleQuestion className={`h-4 w-4 ${darkMode ? "text-purple-300" : "text-purple-500"}`} />
                                        <span className={`text-sm font-medium ${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                                            {room.questionsCount} perguntas
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className={`h-4 w-4 ${darkMode ? "text-purple-300" : "text-purple-500"}`} />
                                        <span className={`text-sm font-medium ${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                                            {dayjs().from(dayjs(room.createdAt), true)}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className={`w-full transition-colors duration-300 ${darkMode
                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                            : "bg-purple-600 hover:bg-purple-700 text-white"
                                            }`}
                                        onClick={() => navigate(`/room/${room.id}`)}
                                    >
                                        Entrar na sala
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )
                    :
                    (
                        <div className="text-center py-12">
                            <MessageCircleQuestion
                                className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-purple-400" : "text-purple-500"}`}
                            />
                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                No rooms found
                            </h3>
                            <p className={`${darkMode ? "text-purple-200" : "text-purple-600"}`}>
                                Try adjusting your search terms to find more rooms.
                            </p>
                        </div>
                    )}
            </main>
        </div>
    )
}
