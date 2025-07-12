"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { Moon, Sun, Mic, MicOff, Send, ArrowLeft, MessageCircleQuestion, Clock, CheckCircle } from "lucide-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { FourSquare } from "react-loading-indicators"
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from "dayjs"
import 'dayjs/locale/pt-br'

type GetRoomsAPIResponse = Array<{
    id: string,
    name: string,
    description: string
}>

type GetQuestionsAPIResponse = Array<{
    id: string,
    roomId: string
    question: string,
    answer: string,
    createdAt: string,
}>

const isRecordingSupported =
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window.MediaRecorder === 'function'

export function Room() {
    const [darkMode, setDarkMode] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [newQuestion, setNewQuestion] = useState("")
    const [questions, setQuestions] = useState<GetQuestionsAPIResponse>()
    const recorder = useRef<MediaRecorder | null>(null)
    const intervalRef = useRef<NodeJS.Timeout>(null)
    const { id } = useParams();
    dayjs.extend(relativeTime);
    dayjs.locale('pt-br')

    const { data: roomsData, isLoading: isRoomsLoading } = useQuery({
        queryKey: ['get-rooms'],
        queryFn: async () => {
            const response = await fetch('http://localhost:3333/rooms')
            const result: GetRoomsAPIResponse = await response.json()
            return result
        }
    })

    const { data: questionsFromAPI } = useQuery({
        queryKey: ['get-questions', id],
        queryFn: async () => {
            const response = await fetch(`http://localhost:3333/questions/${id}`)
            const result: GetQuestionsAPIResponse = await response.json()
            return result
        }
    })


    useEffect(() => {
        if (questionsFromAPI) {
            setQuestions(questionsFromAPI);
        }
    }, [questionsFromAPI]);

    const createQuestionMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`http://localhost:3333/questions/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: newQuestion })
            })

            if (!response.ok) {
                throw new Error("Erro ao criar questão")
            }

            return response.json()
        }
    })

    async function AddQuestion() {
        createQuestionMutation.mutate()
    }

    const rightRoom = roomsData?.find((room) => room.id == id)

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
    }

    const createRecorder = async (audio: MediaStream) => {
        recorder.current = new MediaRecorder(audio, {
            mimeType: 'audio/webm',
            audioBitsPerSecond: 64_000
        })

        recorder.current.ondataavailable = event => {
            if (event.data.size > 0) {
                uploadAudio(event.data)
            }
        }

        recorder.current.onstart = () => {
            console.log('Gravação iniciada')
        }

        recorder.current.onstop = () => {
            console.log('Gravação finalizada')
        }

    }
    const startRecording = async () => {
        if (!isRecordingSupported) {
            alert('Seu navegador não suporta gravação');
            return
        }

        setIsRecording(true)

        const audio = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44_100,
            },
        })

        await createRecorder(audio)

        recorder.current?.start()

        intervalRef.current = setInterval(async () => {
            recorder.current?.stop()
            await createRecorder(audio)
            recorder.current?.start()
        }, 5000)
    }

    const stopRecording = async () => {
        setIsRecording(false)

        if (recorder.current && recorder.current.state !== 'inactive') {
            recorder.current.stop()
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
    }

    async function uploadAudio(audio: Blob) {
        const formData = new FormData()
        formData.append('file', audio, 'audio.webm')

        const response = await fetch(`http://localhost:3333/rooms/${id}/audio`, {
            method: 'POST',
            body: formData
        })

        const data = await response.json();

        console.log('Transcrição recebida:', data.transcription);
        console.log('Embedding recebido:', data.embeddings);

        if (!response.ok) {
            throw new Error("Erro ao transcrever")
        }

        return response.json()
    }

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${darkMode
                ? "bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white"
                : "bg-gradient-to-br from-purple-100 via-purple-50 to-white text-gray-900"
                }`}
        >
            {/* Header */}
            <header
                className={`sticky top-0 z-10 backdrop-blur-md border-b transition-colors duration-300 ${darkMode ? "bg-purple-900/80 border-purple-700" : "bg-white/80 border-purple-200"
                    }`}
            >
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`transition-colors duration-300 ${darkMode ? "border-purple-600 hover:bg-purple-800" : "border-purple-300 hover:bg-purple-100"
                                        }`}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="sr-only">Back to rooms</span>
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">{rightRoom?.name}</h1>
                                <div className="flex items-center gap-4 text-sm">
                                    <p className={darkMode ? "text-purple-200" : "text-purple-600"}>{rightRoom?.description}</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleDarkMode}
                            className={`transition-colors duration-300 ${darkMode ? "border-purple-600 hover:bg-purple-800" : "border-purple-300 hover:bg-purple-100"
                                }`}
                        >
                            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            <span className="sr-only">Toggle dark mode</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recording and Question Section */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Audio Recording */}
                        <Card
                            className={`transition-colors duration-300 ${darkMode ? "bg-purple-800/30 border-purple-600" : "bg-white border-purple-200"
                                }`}
                        >
                            <CardHeader>
                                <CardTitle className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>Record Audio</CardTitle>
                                <CardDescription className={darkMode ? "text-purple-200" : "text-purple-600"}>
                                    Record your voice to ask questions about the content
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-full transition-all duration-300 ${isRecording
                                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                                        : darkMode
                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                            : "bg-purple-600 hover:bg-purple-700 text-white"
                                        }`}
                                >
                                    {isRecording ? (
                                        <>
                                            <MicOff className="h-4 w-4 mr-2" />
                                            Stop Recording
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="h-4 w-4 mr-2" />
                                            Start Recording
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Question Form */}
                        <Card
                            className={`transition-colors duration-300 ${darkMode ? "bg-purple-800/30 border-purple-600" : "bg-white border-purple-200"
                                }`}
                        >
                            <CardHeader>
                                <CardTitle className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>Ask a Question</CardTitle>
                                <CardDescription className={"text-black"}>
                                    Ask about what was discussed in the recording
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={() => AddQuestion()} className="space-y-4">
                                    <Textarea
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="What would you like to know about the recording?"
                                        className={`min-h-[100px] transition-colors duration-300 ${darkMode
                                            ? "bg-purple-800/50 border-purple-600 text-white placeholder:text-purple-300"
                                            : "bg-white border-purple-200 text-black placeholder:text-purple-400"
                                            }`}
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        className={`w-full transition-colors duration-300 ${darkMode
                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                            : "bg-purple-600 hover:bg-purple-700 text-white"
                                            }`}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Question
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Questions and Answers List */}
                    <div className="lg:col-span-2">
                        <Card
                            className={`transition-colors duration-300 ${darkMode ? "bg-purple-800/30 border-purple-600" : "bg-white border-purple-200"
                                }`}
                        >
                            <CardHeader>
                                <CardTitle className={`text-xl ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    Questions & Answers
                                </CardTitle>
                                <CardDescription className={darkMode ? "text-purple-200" : "text-purple-600"}>
                                    All questions asked in this room and their answers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {questions && questions.map((qa) => (
                                        <div
                                            key={qa.id}
                                            className={`p-4 rounded-lg border transition-colors duration-300 ${darkMode ? "bg-purple-900/30 border-purple-700" : "bg-purple-50 border-purple-200"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <MessageCircleQuestion
                                                        className={`h-4 w-4 ${darkMode ? "text-purple-300" : "text-purple-500"}`}
                                                    />
                                                    <span className={`text-sm ${darkMode ? "text-purple-200" : "text-purple-600"}`}>
                                                        Question
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={qa.answer ? "default" : "secondary"}
                                                        className={`${qa.answer
                                                            ? "bg-green-600 text-white"
                                                            : darkMode
                                                                ? "bg-purple-700 text-purple-100"
                                                                : "bg-purple-100 text-purple-700"
                                                            }`}
                                                    >
                                                        {qa.answer ? (
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <Clock className="h-3 w-3 mr-1" />
                                                        )}
                                                        {qa.answer ? "Answered" : "Pending"}
                                                    </Badge>
                                                    <span className={`text-xs ${darkMode ? "text-purple-300" : "text-purple-500"}`}>
                                                        {dayjs().from(dayjs(qa.createdAt), true)}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className={`font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>{qa.question}</h3>

                                            {qa.answer ? (
                                                <div
                                                    className={`p-3 rounded border-l-4 ${darkMode
                                                        ? "bg-purple-800/50 border-l-purple-500 text-purple-100"
                                                        : "bg-white border-l-purple-500 text-gray-700"
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed">{qa.answer}</p>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`p-3 rounded border-l-4 ${darkMode
                                                        ? "bg-purple-800/50 border-l-purple-500 text-purple-100"
                                                        : "bg-white border-l-purple-500 text-gray-700"
                                                        }`}
                                                >
                                                    <FourSquare color="#9810FA" size="small" text="" textColor="" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
