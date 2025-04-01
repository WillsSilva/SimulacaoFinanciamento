"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface LoanChartsProps {
  data: any[]
}

export default function LoanCharts({ data }: LoanChartsProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [yearlyData, setYearlyData] = useState<any[]>([])

  useEffect(() => {
    // Process data for charts
    const processedData = data.map((item) => ({
      mes: item.Mês,
      saldoDevedor: Number(item["Saldo devedor"]),
      amortizacao: Number(item.Amortização),
      juros: Number(item.Juros),
      parcela: Number(item.Parcela),
      amortizacaoExtra: Number(item["Amortização Ext."]),
      parcelasRestantes: item["Parcelas restantes"],
    }))

    setChartData(processedData)

    // Create yearly data for simplified view
    const yearly = []
    for (let i = 0; i < data.length; i += 12) {
      if (data[i]) {
        yearly.push({
          ano: Math.ceil(data[i].Mês / 12),
          mes: data[i].Mês,
          saldoDevedor: Number(data[i]["Saldo devedor"]),
          parcela: Number(data[i].Parcela),
        })
      }
    }
    setYearlyData(yearly)
  }, [data])

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  // Calculate first year payment breakdown
  const firstYearData = data.slice(0, 12)
  const totalFirstYear = firstYearData.reduce((acc, item) => acc + Number(item.Parcela), 0)
  const totalAmortizacao = firstYearData.reduce((acc, item) => acc + Number(item.Amortização), 0)
  const totalJuros = firstYearData.reduce((acc, item) => acc + Number(item.Juros), 0)
  const totalSeguro = totalFirstYear - totalAmortizacao - totalJuros

  const pieData = [
    { name: "Amortização", value: totalAmortizacao },
    { name: "Juros", value: totalJuros },
    { name: "Seguro", value: totalSeguro },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-medium">{`Mês: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(Number(entry.value))}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Tabs defaultValue="balance">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="balance">Saldo Devedor</TabsTrigger>
        <TabsTrigger value="payments">Parcelas</TabsTrigger>
        <TabsTrigger value="breakdown">Composição</TabsTrigger>
        <TabsTrigger value="comparison">Comparativo</TabsTrigger>
      </TabsList>

      <TabsContent value="balance">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Evolução do Saldo Devedor</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ano" label={{ value: "Anos", position: "insideBottomRight", offset: 0 }} />
                  <YAxis
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    label={{ value: "Saldo (R$)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="saldoDevedor"
                    name="Saldo Devedor"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payments">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Valor das Parcelas</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.filter((_, i) => i % 12 === 0 || i === 0 || i === chartData.length - 1)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" label={{ value: "Mês", position: "insideBottomRight", offset: 0 }} />
                  <YAxis
                    tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                    label={{ value: "Valor (R$)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="parcela" name="Parcela" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="breakdown">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Composição da Parcela (Primeiro Ano)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 12)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `R$ ${value.toFixed(0)}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="amortizacao" name="Amortização" stackId="a" fill="#0088FE" />
                    <Bar dataKey="juros" name="Juros" stackId="a" fill="#00C49F" />
                    <Bar dataKey="amortizacaoExtra" name="Amort. Extra" stackId="a" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="comparison">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Comparativo Juros x Amortização</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.filter((_, i) => i % 12 === 0 || i === 0 || i === chartData.length - 1)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `R$ ${value.toFixed(0)}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="amortizacao"
                    name="Amortização"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area type="monotone" dataKey="juros" name="Juros" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}