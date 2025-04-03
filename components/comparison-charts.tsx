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
  BarChart,
  Bar,
  ComposedChart,
} from "recharts"

interface ComparisonChartsProps {
  sacData: any[]
  priceData: any[]
}

export default function ComparisonCharts({ sacData, priceData }: ComparisonChartsProps) {
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [totalPaidData, setTotalPaidData] = useState<any[]>([])

  useEffect(() => {
    if (sacData.length === 0 || priceData.length === 0) return

    // Prepare data for comparison charts
    const maxLength = Math.min(sacData.length, priceData.length)
    const comparison = []

    let totalPaidSAC = 0
    let totalPaidPRICE = 0
    let totalInterestSAC = 0
    let totalInterestPRICE = 0

    const totalPaid = []

    for (let i = 0; i < maxLength; i++) {
      if (sacData[i] && priceData[i]) {
        // Acumular valores pagos
        totalPaidSAC += Number(sacData[i].Parcela)
        totalPaidPRICE += Number(priceData[i].Parcela)
        totalInterestSAC += Number(sacData[i].Juros)
        totalInterestPRICE += Number(priceData[i].Juros)

        // Dados para comparação mensal
        comparison.push({
          mes: sacData[i].Mês,
          parcelaSAC: Number(sacData[i].Parcela),
          parcelaPRICE: Number(priceData[i].Parcela),
          saldoSAC: Number(sacData[i]["Saldo devedor"]),
          saldoPRICE: Number(priceData[i]["Saldo devedor"]),
          jurosSAC: Number(sacData[i].Juros),
          jurosPRICE: Number(priceData[i].Juros),
          amortizacaoSAC: Number(sacData[i].Amortização),
          amortizacaoPRICE: Number(priceData[i].Amortização),
        })

        // Dados para comparação de valores totais pagos
        if (i % 12 === 0 || i === maxLength - 1) {
          totalPaid.push({
            mes: sacData[i].Mês,
            totalPagoSAC: totalPaidSAC,
            totalPagoPRICE: totalPaidPRICE,
            totalJurosSAC: totalInterestSAC,
            totalJurosPRICE: totalInterestPRICE,
            diferencaTotal: totalPaidPRICE - totalPaidSAC,
            diferencaJuros: totalInterestPRICE - totalInterestSAC,
          })
        }
      }
    }

    setComparisonData(comparison)
    setTotalPaidData(totalPaid)
  }, [sacData, priceData])

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
    <Tabs defaultValue="parcelas">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="parcelas">Parcelas</TabsTrigger>
        <TabsTrigger value="saldo">Saldo Devedor</TabsTrigger>
        <TabsTrigger value="juros">Juros</TabsTrigger>
        <TabsTrigger value="total">Total Pago</TabsTrigger>
      </TabsList>

      <TabsContent value="parcelas">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Comparativo de Parcelas</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparisonData.filter((_, i) => i % 12 === 0 || i === 0 || i === comparisonData.length - 1)}
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
                  <Line type="monotone" dataKey="parcelaSAC" name="Parcela SAC" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="parcelaPRICE"
                    name="Parcela PRICE"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Análise:</h4>
              <p>
                No sistema SAC, as parcelas são decrescentes ao longo do tempo, enquanto no sistema PRICE as parcelas
                são fixas (exceto por pequenas variações devido à TR).
              </p>
              <p className="mt-2">
                As parcelas iniciais do SAC são maiores que as do PRICE, mas com o tempo se tornam menores.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="saldo">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Comparativo de Saldo Devedor</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparisonData.filter((_, i) => i % 12 === 0 || i === 0 || i === comparisonData.length - 1)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" label={{ value: "Mês", position: "insideBottomRight", offset: 0 }} />
                  <YAxis
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    label={{ value: "Saldo (R$)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="saldoSAC" name="Saldo SAC" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="saldoPRICE" name="Saldo PRICE" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Análise:</h4>
              <p>
                No sistema SAC, o saldo devedor diminui mais rapidamente no início do financiamento, pois a amortização
                é constante.
              </p>
              <p className="mt-2">
                No sistema PRICE, a amortização é crescente, o que faz com que o saldo devedor diminua mais lentamente
                no início.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="juros">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Comparativo de Juros</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={comparisonData.filter((_, i) => i % 12 === 0 || i === 0 || i === comparisonData.length - 1)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" label={{ value: "Mês", position: "insideBottomRight", offset: 0 }} />
                  <YAxis
                    tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                    label={{ value: "Juros (R$)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="jurosSAC" name="Juros SAC" fill="#8884d8" barSize={20} />
                  <Bar dataKey="jurosPRICE" name="Juros PRICE" fill="#82ca9d" barSize={20} />
                  <Line
                    type="monotone"
                    dataKey="amortizacaoSAC"
                    name="Amortização SAC"
                    stroke="#ff7300"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="amortizacaoPRICE"
                    name="Amortização PRICE"
                    stroke="#ff0000"
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Análise:</h4>
              <p>
                No sistema SAC, os juros diminuem mais rapidamente, pois são calculados sobre um saldo devedor que
                diminui a uma taxa constante.
              </p>
              <p className="mt-2">
                No sistema PRICE, os juros são maiores no início e diminuem mais lentamente, enquanto a amortização
                aumenta ao longo do tempo.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="total">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Total Pago e Economia</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalPaidData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" label={{ value: "Mês", position: "insideBottomRight", offset: 0 }} />
                  <YAxis
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    label={{ value: "Valor Total (R$)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="totalPagoSAC" name="Total Pago SAC" fill="#8884d8" />
                  <Bar dataKey="totalPagoPRICE" name="Total Pago PRICE" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalPaidData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" label={{ value: "Mês", position: "insideBottomRight", offset: 0 }} />
                  <YAxis
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    label={{ value: "Juros Totais (R$)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="totalJurosSAC" name="Juros Totais SAC" fill="#8884d8" />
                  <Bar dataKey="totalJurosPRICE" name="Juros Totais PRICE" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Análise Financeira:</h4>
              <p>
                No sistema SAC, o total pago ao final do financiamento é geralmente menor que no sistema PRICE,
                principalmente devido ao menor valor total de juros.
              </p>
              <p className="mt-2">
                A economia com o sistema SAC em relação ao PRICE pode ser significativa no longo prazo, mas exige maior
                capacidade de pagamento no início do financiamento.
              </p>
              <p className="mt-2">
                O sistema PRICE é mais adequado para quem precisa de parcelas fixas para planejamento financeiro,
                enquanto o SAC é mais vantajoso para quem pode arcar com parcelas maiores no início.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}