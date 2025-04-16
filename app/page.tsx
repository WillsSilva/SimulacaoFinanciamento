"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ResultsTable from "@/components/results-table"
import LoanCharts from "@/components/loan-charts"
import ComparisonCharts from "@/components/comparison-charts"

const formSchema = z.object({
  valor: z.coerce.number().positive("O valor deve ser positivo"),
  num_parcelas: z.coerce.number().int().positive("O número de parcelas deve ser positivo"),
  taxa_anual: z.coerce.number().positive("A taxa anual deve ser positiva"),
  tr: z.coerce.number().min(0, "A TR deve ser maior ou igual a zero"),
  parcela_alvo: z.coerce.number().int().positive("A parcela alvo deve ser positiva"),
  amortizacao_extra: z.coerce.number().min(0, "A amortização extra deve ser maior ou igual a zero"),
  tipo_amortizacao: z.string().default("SEM AMORTIZAÇÃO"),
  sistema: z.enum(["SAC", "PRICE"]).default("SAC"),
})

type FormValues = z.infer<typeof formSchema>

export default function Home() {
  const [resultsSAC, setResultsSAC] = useState<any[]>([])
  const [resultsPRICE, setResultsPRICE] = useState<any[]>([])
  const [activeSystem, setActiveSystem] = useState<"SAC" | "PRICE" | "COMPARISON">("SAC")
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valor: 166078,
      num_parcelas: 420,
      taxa_anual: 5.64,
      tr: 0.17,
      parcela_alvo: 1200,
      amortizacao_extra: 0,
      tipo_amortizacao: "SEM AMORTIZAÇÃO",
      sistema: "SAC",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      // Calcular SAC
      const responseSAC = await fetch("http://apisimulacao.duckdns.org:8000/calcular_sac", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          tipo_amortizacao: values.tipo_amortizacao,
        }),
      })

      const dataSAC = await responseSAC.json()
      setResultsSAC(dataSAC.parcelas)

      // Calcular PRICE (assumindo que a API tem esse endpoint)
      // Se a API não tiver esse endpoint, você precisará implementá-lo no backend
      try {
        const responsePRICE = await fetch("http://apisimulacao.duckdns.org:8000/calcular_price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            tipo_amortizacao: values.tipo_amortizacao,
          }),
        })

        const dataPRICE = await responsePRICE.json()
        setResultsPRICE(dataPRICE.parcelas)
      } catch (error) {
        console.error("Erro ao calcular PRICE (endpoint pode não existir):", error)
        // Simulação de dados PRICE para demonstração
        // Remova esta parte quando o endpoint estiver disponível
        simulatePriceData(values)
      }

      // Definir o sistema ativo com base na seleção do usuário
      setActiveSystem(values.sistema === "SAC" ? "SAC" : "PRICE")
    } catch (error) {
      console.error("Erro ao calcular:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para simular dados PRICE (remova quando o endpoint estiver disponível)
  function simulatePriceData(values: FormValues) {
    const valor = values.valor
    const num_parcelas = values.num_parcelas
    const taxa_anual = values.taxa_anual
    const tr = values.tr / 100

    // Cálculo da taxa mensal
    const taxa_mensal = Math.pow(1 + taxa_anual / 100, 1 / 12) - 1

    // Cálculo da parcela fixa (fórmula PRICE)
    const parcela_fixa =
      (valor * (taxa_mensal * Math.pow(1 + taxa_mensal, num_parcelas))) / (Math.pow(1 + taxa_mensal, num_parcelas) - 1)

    // Simulação do seguro
    const tx_seguro = (valor * 0.185) / num_parcelas + 25

    let saldo_devedor = valor * (1 + tr)
    const parcelas = []

    for (let mes = 1; mes <= num_parcelas; mes++) {
      const juros = saldo_devedor * taxa_mensal
      const amortizacao = parcela_fixa - juros
      const parcela_total = parcela_fixa + tx_seguro

      parcelas.push({
        Mês: mes,
        "Saldo devedor": saldo_devedor,
        Amortização: amortizacao,
        Juros: juros,
        Parcela: parcela_total,
        "Amortização Ext.": values.amortizacao_extra,
        "Tipo de Amortização": values.tipo_amortizacao,
        "Parcelas restantes": num_parcelas - mes + 1,
        "Prazo Final": num_parcelas - mes + 1,
      })

      saldo_devedor = (saldo_devedor - amortizacao) * (1 + tr)

      // Ajuste para amortização extra
      saldo_devedor = Math.max(0, saldo_devedor - values.amortizacao_extra)

      // Se o saldo devedor for zero ou negativo, encerrar o loop
      if (saldo_devedor <= 0) {
        break
      }
    }

    setResultsPRICE(parcelas)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Calculadora de Financiamento</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parâmetros do Financiamento</CardTitle>
            <CardDescription>Preencha os dados para calcular seu financiamento</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="sistema"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Sistema de Amortização</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SAC" id="sac" />
                            <FormLabel htmlFor="sac" className="font-normal cursor-pointer">
                              SAC
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PRICE" id="price" />
                            <FormLabel htmlFor="price" className="font-normal cursor-pointer">
                              PRICE
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        SAC: Amortização constante, parcelas decrescentes
                        <br />
                        PRICE: Parcelas fixas, amortização crescente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Financiamento (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="num_parcelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxa_anual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Juros Anual (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TR (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parcela_alvo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcela Alvo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tipo_amortizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Amortização</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de amortização" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SEM AMORTIZAÇÃO">Sem Amortização</SelectItem>
                          <SelectItem value="REDUZIR PARCELA">Reduzir Parcela</SelectItem>
                          <SelectItem value="REDUZIR PRAZO">Reduzir Prazo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Calculando..." : "Calcular"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {(resultsSAC.length > 0 || resultsPRICE.length > 0) && (
            <Tabs
              defaultValue={activeSystem.toLowerCase()}
              onValueChange={(value) => {
                if (value === "comparison") {
                  setActiveSystem("COMPARISON")
                } else if (value === "sac") {
                  setActiveSystem("SAC")
                } else {
                  setActiveSystem("PRICE")
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sac" disabled={resultsSAC.length === 0}>
                  SAC
                </TabsTrigger>
                <TabsTrigger value="price" disabled={resultsPRICE.length === 0}>
                  PRICE
                </TabsTrigger>
                <TabsTrigger value="comparison" disabled={resultsSAC.length === 0 || resultsPRICE.length === 0}>
                  Comparativo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sac">
                <Tabs defaultValue="charts">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="charts">Gráficos</TabsTrigger>
                    <TabsTrigger value="table">Tabela</TabsTrigger>
                  </TabsList>
                  <TabsContent value="charts">
                    <Card>
                      <CardHeader>
                        <CardTitle>Visualização do Financiamento SAC</CardTitle>
                        <CardDescription>Gráficos de evolução do financiamento</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LoanCharts data={resultsSAC} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="table">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tabela de Amortização SAC</CardTitle>
                        <CardDescription>Detalhamento das parcelas do financiamento</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResultsTable data={resultsSAC} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="price">
                <Tabs defaultValue="charts">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="charts">Gráficos</TabsTrigger>
                    <TabsTrigger value="table">Tabela</TabsTrigger>
                  </TabsList>
                  <TabsContent value="charts">
                    <Card>
                      <CardHeader>
                        <CardTitle>Visualização do Financiamento PRICE</CardTitle>
                        <CardDescription>Gráficos de evolução do financiamento</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LoanCharts data={resultsPRICE} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="table">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tabela de Amortização PRICE</CardTitle>
                        <CardDescription>Detalhamento das parcelas do financiamento</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResultsTable data={resultsPRICE} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>Comparativo SAC vs PRICE</CardTitle>
                    <CardDescription>Análise comparativa entre os sistemas de amortização</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ComparisonCharts sacData={resultsSAC} priceData={resultsPRICE} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </main>
  )
}