"use client"

import { ArrowRight, Calendar as CalendarIcon, CircleUserRound, Hexagon, Menu, Settings } from "lucide-react";
import icon from '../assets/icon.png'
import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";

const chartData = [
    { week: "1ª semana", lastMonth: 186, thisMonth: 80 },
    { week: "2ª semana", lastMonth: 305, thisMonth: 200 },
    { week: "3ª semana", lastMonth: 237, thisMonth: 120 },
    { week: "4ª semana", lastMonth: 73, thisMonth: 190 },
]

const chartConfig = {
    lastMonth: {
        label: "Mês passado",
        color: "var(--chart-1)",
    },
    thisMonth: {
        label: "Mês atual",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function Dashboard() {
    const [userName, setUserName] = useState("Gabriel");
    const [productsEnding, setProductsEnding] = useState(["Arroz", "Feijão", "Macarrão", "Óleo"]);
    const [productsSold, setProductsSold] = useState(["Arroz", "Feijão", "Leite"]);
    const [toPayToday, setToPayToday] = useState(200.00);
    const [toReceiveToday, setToReceiveToday] = useState(200.00);
    const [soldToday, setSoldToday] = useState(200.00);
    const [soldThisMonth, setSoldThisMonth] = useState(200.00);
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [openMenu, setOpenMenu] = useState(false)

    function toggleMenu() {
        setOpenMenu((prev) => !prev)
    }

    const comparison = useMemo(() => {
        let lastMonth = 0;
        let thisMonth = 0;

        for (let i = 0; i < chartData.length; i++) {
            lastMonth += chartData[i].lastMonth;
            thisMonth += chartData[i].thisMonth;
        }

        const diff = thisMonth - lastMonth;
        const percent = lastMonth !== 0 ? ((diff / lastMonth) * 100).toFixed(1) : "0";

        return {
            label: diff > 0 ? `↑ ${percent}%` : diff < 0 ? `↓ ${percent}%` : "Sem variação",
            color: diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-gray-300",
        };
    }, [chartData]);

    return (
        <div className="bg-tsl-bg min-h-screen flex flex-col items-center pb-40">
            <header className="bg-tsl-header w-full max-w-screen h-20 flex items-center justify-between px-8 overflow-hidden">
                <div className="flex items-center">
                    <Menu className="text-white cursor-pointer" size={40} onClick={() => toggleMenu()} />
                    <img src={icon} alt="Logo" className="h-12 w-12 inline-block ml-2" />
                </div>
                <div className="flex items-center space-x-6">
                    <Link to={"/"} className="text-tsl-orange font-bold hover:underline">Home</Link>
                    <Link to={"/"} className="text-white hover:underline">Comunicados</Link>
                    <Link to={"/"} className="text-white hover:underline">Tarefas</Link>
                    <Link to={"/"} className="text-white hover:underline">Pendências</Link>
                </div>
                <div className="flex items-center space-x-4">
                    <CircleUserRound className="text-white" size={40} />
                    <Settings className="text-white" size={40} />
                </div>
            </header>
            <div
                className={`bg-tsl-header w-full overflow-hidden transition-all duration-500 ease-in-out flex flex-col items-center justify-between ${openMenu ? "max-h-60 py-4" : "max-h-0 py-0 border-none"
                    }`}
            >
                <div className="border-t border-white w-80 mb-4" />
                <div className="flex flex-wrap justify-evenly items-center text-white text-lg w-full gap-4">
                    <p className="hover:underline cursor-pointer">Gestão de Vendas</p>
                    <p className="hover:underline cursor-pointer">Gestão de Estoque</p>
                    <p className="hover:underline cursor-pointer">Gestão de Compras</p>
                    <p className="hover:underline cursor-pointer">Gestão Financeira</p>
                    <p className="hover:underline cursor-pointer">Gestão de Usuários</p>
                    <p className="hover:underline cursor-pointer">Ponto Eletrônico</p>
                </div>
            </div>


            {/* Dashboard */}
            <div className="mt-20 w-8/12 flex flex-col items-start">
                <div>
                    <h1 className="text-white text-4xl text-left">Olá, <span style={{ fontWeight: 600 }}>{userName}!</span></h1>
                </div>
                <div className="w-full bg-tsl-header h-15 mt-15 flex items-center rounded-lg text-white gap-2 justify-between">
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="text-white ml-4" size={24} />
                        <p className="text-lg">Alterar data da dashboard</p>
                    </div>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-48 justify-between font-normal bg-tsl-header border-tsl-orange text-white hover:bg-tsl-orange/10 hover:text-white"
                            >
                                {date ? date.toLocaleDateString("pt-BR") : "Alterar data"}
                                <ChevronDownIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0 bg-tsl-header text-white border-tsl-orange" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setDate(date)
                                    setOpen(false)
                                }}

                                className="rounded-md bg-tsl-header"
                                classNames={{
                                    day: "bg-transparent",
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="mt-10 min-w-full gap">
                    <div className="grid grid-cols-2 w-full gap-4">
                        <div className="w-full">
                            <div className="bg-tsl-header rounded-lg p-4 text-white flex flex-col justify-between w-full">
                                <p className="text-2xl text-left">A receber hoje:</p>
                                <p className="text-3xl text-left mb-1.5" style={{ fontWeight: '300' }}>R${toReceiveToday}</p>
                                <span className="w-full flex items-center gap-1 group text-tsl-orange text-left hover:underline cursor-pointer">
                                    Ver mais detalhes
                                    <ArrowRight className="text-tsl-orange transition-all duration-300 ease-in-out group-hover:translate-x-1" />
                                </span>
                            </div>
                            <div className="bg-tsl-header rounded-lg p-4 text-white flex flex-col justify-between w-full mt-5">
                                <p className="text-2xl text-left">A pagar hoje:</p>
                                <p className="text-3xl text-left mb-1.5" style={{ fontWeight: '300' }}>R${toPayToday}</p>
                                <span className="w-full flex items-center gap-1 group text-tsl-orange text-left hover:underline cursor-pointer">
                                    Ver mais detalhes
                                    <ArrowRight className="text-tsl-orange transition-all duration-300 ease-in-out group-hover:translate-x-1" />
                                </span>
                            </div>
                        </div>
                        <div className="w-full h-full bg-tsl-header rounded-lg p-4 text-white flex flex-col justify-between text-left">
                            <span className="text-2xl flex items-center gap-1 text-tsl-orange">Estoque crítico</span>
                            <p className="text-xl">{productsEnding.length} produtos abaixo do mínimo:</p>
                            {
                                productsEnding.map((product, index) => (
                                    <p key={index}>{index + 1}. {product}</p>
                                ))
                            }
                            <span className="w-full flex items-center gap-1 group text-tsl-orange text-left hover:underline cursor-pointer">
                                Ver mais detalhes
                                <ArrowRight className="text-tsl-orange transition-all duration-300 ease-in-out group-hover:translate-x-1" />
                            </span>
                        </div>
                    </div>
                    <div className="mt-10 w-full bg-tsl-header rounded-lg p-4 text-white grid grid-cols-2 gap-4">
                        <div>
                            <div className="p-4 flex flex-col justify-between w-full">
                                <p className="text-2xl text-left">Vendas do dia:</p>
                                <p className="text-3xl text-left mb-1.5" style={{ fontWeight: '300' }}>R${soldToday}</p>
                                <span className="w-full flex items-center gap-1 group text-tsl-orange text-left hover:underline cursor-pointer">
                                    Ver mais detalhes
                                    <ArrowRight className="text-tsl-orange transition-all duration-300 ease-in-out group-hover:translate-x-1" />
                                </span>
                            </div>
                            <div className="p-4 flex flex-col justify-between w-full">
                                <p className="text-2xl text-left">Vendas do mês:</p>
                                <p className="text-3xl text-left mb-1.5" style={{ fontWeight: '300' }}>R${soldThisMonth}</p>
                                <span className="w-full flex items-center gap-1 group text-tsl-orange text-left hover:underline cursor-pointer">
                                    Ver mais detalhes
                                    <ArrowRight className="text-tsl-orange transition-all duration-300 ease-in-out group-hover:translate-x-1" />
                                </span>
                            </div>
                            <div className="p-4 pb-0 flex flex-col justify-between w-full text-left">
                                <p className="text-2xl text-left">Produtos mais vendidos:</p>
                                {productsSold.map((product, index) => (
                                    <p key={index} className="text-lg font-light">{index + 1}. {product}</p>
                                ))}
                                <span className="w-full flex items-center gap-1 group text-tsl-orange text-left hover:underline cursor-pointer">
                                    Ver mais detalhes
                                    <ArrowRight className="text-tsl-orange transition-all duration-300 ease-in-out group-hover:translate-x-1" />
                                </span>
                            </div>
                        </div>
                        <div className="w-full h-full flex flex-col items-center justify-between pt-4">
                            <p className="text-2xl text-left">Comparação com o último mês:<br /><span className={comparison.color}> {comparison.label}</span></p>
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <LineChart
                                    accessibilityLayer
                                    data={chartData}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                        top: 12,
                                        bottom: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} stroke="#374151" />
                                    <XAxis
                                        dataKey="week"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 10)}
                                        tick={{ fill: "white", fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fill: "white", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Line
                                        dataKey="thisMonth"
                                        type="linear"
                                        stroke="#fe5f2f"
                                        strokeWidth={2}
                                        dot={({ cx, cy, payload }) => {
                                            const r = 15
                                            return (
                                                <Hexagon
                                                    key={payload.month}
                                                    x={cx - r / 2}
                                                    y={cy - r / 2}
                                                    size={15}
                                                    fill="hsl(var(--background))"
                                                    stroke="#fe5f2f"
                                                />
                                            )
                                        }}
                                    />
                                    <Line
                                        dataKey="lastMonth"
                                        type="linear"
                                        stroke="white"
                                        strokeWidth={2}
                                        dot={({ cx, cy, payload }) => {
                                            const r = 15
                                            return (
                                                <Hexagon
                                                    key={payload.month}
                                                    x={cx - r / 2}
                                                    y={cy - r / 2}
                                                    size={15}
                                                    fill="hsl(var(--background))"
                                                    stroke="white"
                                                />
                                            )
                                        }}
                                    />
                                </LineChart>
                            </ChartContainer>
                            <span className="w-full flex items-center gap-1 group text-tsl-orange text-left hover:underline cursor-pointer">
                                Ver mais detalhes
                                <ArrowRight className="text-tsl-orange transition-all duration-300 ease-in-out group-hover:translate-x-1" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
