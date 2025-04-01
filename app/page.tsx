"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResultsTable from "@/components/results-table"
import LoanCharts from "@/components/loan-charts"

const formSchema = z.object({
  valor: z.coerce.number().positive("O valor deve ser positivo"),
  num_parcelas: z.coerce.number().int().positive("O número de parcelas deve ser positivo"),
  taxa_anual: z.coerce.number().positive("A taxa anual deve ser positiva"),
  tr: z.coerce.number().min(0, "A TR deve ser maior ou igual a zero"),
  parcela_alvo: z.coerce.number().int().positive("A parcela alvo deve ser positiva"),
  amortizacao_extra: z.coerce.number().min(0, "A amortização extra deve ser maior ou igual a zero"),
  tipo_amortizacao: z.string().default("SEM AMORTIZAÇÃO"),
})

type FormValues = z.infer<typeof formSchema>

export default function Home() {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valor: 200000,
      num_parcelas: 360,
      taxa_anual: 8.99,
      tr: 0.5,
      parcela_alvo: 0,
      amortizacao_extra: 0,
      tipo_amortizacao: "SEM AMORTIZAÇÃO",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/calcular_sac", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      setResults(data.parcelas)
    } catch (error) {
      console.error("Erro ao calcular:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Calculadora de Financiamento SAC</h1>

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
                  name="amortizacao_extra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amortização Extra (R$)</FormLabel>
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
          {results.length > 0 && (
            <Tabs defaultValue="charts">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
                <TabsTrigger value="table">Tabela</TabsTrigger>
              </TabsList>
              <TabsContent value="charts">
                <Card>
                  <CardHeader>
                    <CardTitle>Visualização do Financiamento</CardTitle>
                    <CardDescription>Gráficos de evolução do financiamento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoanCharts data={results} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="table">
                <Card>
                  <CardHeader>
                    <CardTitle>Tabela de Amortização</CardTitle>
                    <CardDescription>Detalhamento das parcelas do financiamento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultsTable data={results} />
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

