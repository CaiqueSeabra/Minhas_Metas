import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  CalendarDays, 
  Wallet, 
  Tag, 
  Target, 
  Plus, 
  CheckCircle2, 
  TrendingUp,
  LayoutGrid,
  Banknote,
  X,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  PieChart as PieChartIcon,
  AlertTriangle,
  BellRing,
  RefreshCw
} from 'lucide-react';

interface Meta {
  id: number;
  descricao: string;
  valor: number;
  vencimento: string;
  dataInicio?: string;
  progresso?: number;
  pago?: boolean;
  recorrente?: boolean;
}

export default function App() {
  const [metas, setMetas] = useState<Meta[]>(() => {
    const salvas = localStorage.getItem('metas_carlos');
    if (salvas) {
      try {
        return JSON.parse(salvas);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [descricao, setDescricao] = useState('');
  const [valorInput, setValorInput] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  
  const [addProgressId, setAddProgressId] = useState<number | null>(null);
  const [progressInput, setProgressInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<'ativas' | 'historico' | 'grafico'>('ativas');

  const [diasTrabalho, setDiasTrabalho] = useState<number[]>(() => {
    const saved = localStorage.getItem('dias_trabalho_carlos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [0, 1, 2, 3, 4, 5, 6]; // Default: todos os dias
  });

  const today = new Date();
  const currentPeriodDefaultStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriodDefaultStr);

  useEffect(() => {
    localStorage.setItem('metas_carlos', JSON.stringify(metas));
  }, [metas]);

  useEffect(() => {
    localStorage.setItem('dias_trabalho_carlos', JSON.stringify(diasTrabalho));
  }, [diasTrabalho]);


  const calcularDiasUteis = (startDate: Date, endDate: Date, diasSelecionados: number[]) => {
    let count = 0;
    
    // Zera as horas para comparar apenas as datas
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) {
      if (diasSelecionados.includes(start.getDay())) {
        count = 1;
      }
    } else {
      for (let i = 0; i < diffDays; i++) {
        const currentDate = new Date(start.getTime() + i * (1000 * 60 * 60 * 24));
        if (diasSelecionados.includes(currentDate.getDay())) {
          count++;
        }
      }
    }
    
    return count > 0 ? count : 1;
  };

  const toggleDiaTrabalho = (diaIndex: number) => {
    setDiasTrabalho(prev => 
      prev.includes(diaIndex) 
        ? prev.filter(d => d !== diaIndex)
        : [...prev, diaIndex].sort((a, b) => a - b)
    );
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyDigits = value.replace(/\D/g, '');
    if (onlyDigits === '') {
      setValorInput('');
      return;
    }
    const numericValue = parseInt(onlyDigits, 10) / 100;
    const formatted = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setValorInput(formatted);
  };

  const getNumericValor = () => {
    const onlyDigits = valorInput.replace(/\D/g, '');
    if (onlyDigits === '') return 0;
    return parseInt(onlyDigits, 10) / 100;
  };

  const adicionarMeta = () => {
    const valor = getNumericValor();
    if (!descricao.trim() || valor <= 0 || !dataFinal) {
      alert("Aviso: Preencha todos os campos corretamente.");
      return;
    }

    const novaMeta: Meta = {
      id: Date.now(),
      descricao: descricao.trim(),
      valor: valor,
      vencimento: dataFinal,
      dataInicio: dataInicio || undefined,
      recorrente: recorrente
    };

    setMetas([...metas, novaMeta]);
    setDescricao('');
    setValorInput('');
    setDataInicio('');
    setRecorrente(false);
    setSelectedPeriod(dataFinal.substring(0, 7));
  };

  const deletarMeta = (id: number) => {
    setMetas(metas.filter(m => m.id !== id));
  };

  const processarRecorrencia = (metaAtual: Meta, novasMetas: Meta[]) => {
    if (!metaAtual.recorrente) return;
    const [anoStr, mesStr, diaStr] = metaAtual.vencimento.split('-');
    let data = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));
    data.setMonth(data.getMonth() + 1);
    
    if (data.getMonth() !== (parseInt(mesStr) % 12)) {
      data.setDate(0);
    }

    const nextVencimento = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
    
    let nextDataInicio = undefined;
    if (metaAtual.dataInicio) {
      const [anoIStr, mesIStr, diaIStr] = metaAtual.dataInicio.split('-');
      let dataI = new Date(parseInt(anoIStr), parseInt(mesIStr) - 1, parseInt(diaIStr));
      dataI.setMonth(dataI.getMonth() + 1);
      if (dataI.getMonth() !== (parseInt(mesIStr) % 12)) {
        dataI.setDate(0);
      }
      nextDataInicio = `${dataI.getFullYear()}-${String(dataI.getMonth() + 1).padStart(2, '0')}-${String(dataI.getDate()).padStart(2, '0')}`;
    }

    const alreadyExists = novasMetas.some(m => m.descricao === metaAtual.descricao && m.vencimento === nextVencimento && !m.pago);
    
    if (!alreadyExists) {
      novasMetas.push({
        id: Date.now() + Math.random(),
        descricao: metaAtual.descricao,
        valor: metaAtual.valor,
        vencimento: nextVencimento,
        dataInicio: nextDataInicio,
        recorrente: true,
        progresso: 0,
        pago: false
      });
    }
  };

  const marcarComoPago = (id: number) => {
    setMetas(prevMetas => {
      const meta = prevMetas.find(m => m.id === id);
      if (!meta) return prevMetas;
      
      const newMetas = prevMetas.map(m => m.id === id ? { ...m, pago: true } : m);
      processarRecorrencia(meta, newMetas);
      return newMetas;
    });
  };

  const reverterPagamento = (id: number) => {
    setMetas(metas.map(m => {
      if (m.id === id) {
        return { ...m, pago: false };
      }
      return m;
    }));
  };

  const handleProgressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyDigits = value.replace(/\D/g, '');
    if (onlyDigits === '') {
      setProgressInput('');
      return;
    }
    const numericValue = parseInt(onlyDigits, 10) / 100;
    setProgressInput(numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
  };

  const handleSetProgress = (id: number) => {
    const onlyDigits = progressInput.replace(/\D/g, '');
    const numericValue = onlyDigits === '' ? 0 : parseInt(onlyDigits, 10) / 100;
    
    setMetas(prevMetas => {
      const meta = prevMetas.find(m => m.id === id);
      if (!meta) return prevMetas;

      const isPago = numericValue >= meta.valor;
      const newMetas = prevMetas.map(m => {
        if (m.id === id) {
          return { ...m, progresso: isPago ? m.valor : numericValue, pago: isPago ? true : m.pago };
        }
        return m;
      });

      if (isPago && !meta.pago) {
        processarRecorrencia(meta, newMetas);
      }

      return newMetas;
    });
    
    setAddProgressId(null);
    setProgressInput('');
  };

  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  let mm = String(hoje.getMonth() + 1).padStart(2, '0');
  let dd = String(hoje.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;

  const periods = Array.from(new Set([currentPeriodDefaultStr, ...metas.map(m => m.vencimento.substring(0, 7))])).sort();

  const formatPeriod = (periodStr: string) => {
    const [year, month] = periodStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const mesStr = date.toLocaleDateString('pt-BR', { month: 'long' });
    return `${mesStr.charAt(0).toUpperCase() + mesStr.slice(1)} ${year}`;
  };

  const formatPeriodShort = (periodStr: string) => {
    const [year, month] = periodStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const mesStr = date.toLocaleDateString('pt-BR', { month: 'short' });
    return `${mesStr.charAt(0).toUpperCase() + mesStr.slice(1, 3)} ${year}`;
  };

  // Calculate totals
  let somaMetaGeral = 0;
  let somaTotalFaturas = 0;
  let somaTotalProgresso = 0;
  let somaMetaGeralSemanal = 0;
  const dataAtual = new Date();
  dataAtual.setHours(0, 0, 0, 0);

  const filteredMetas = metas.filter(m => m.vencimento.startsWith(selectedPeriod));
  const metasAtivas = filteredMetas.filter(m => !m.pago);
  const metasPagas = filteredMetas.filter(m => m.pago);

  const metasComCalculo = metasAtivas.map(meta => {
    const progressoAtual = meta.progresso || 0;
    const restante = Math.max(0, meta.valor - progressoAtual);
    const porcentagem = Math.min(100, Math.round((progressoAtual / meta.valor) * 100));

    const dataVencimento = new Date(meta.vencimento + 'T00:00:00');
    
    let dataReferencia = dataAtual;
    if (meta.dataInicio) {
      const dataI = new Date(meta.dataInicio + 'T00:00:00');
      if (dataI > dataAtual) {
        dataReferencia = dataI;
      }
    }

    const diferencaMilissegundosReal = dataVencimento.getTime() - dataAtual.getTime();
    const diasParaVencer = Math.round(diferencaMilissegundosReal / (1000 * 60 * 60 * 24));
    
    let diasCalculo = calcularDiasUteis(dataReferencia, dataVencimento, diasTrabalho);
    
    const metaDiaria = Math.ceil(restante / diasCalculo);
    const metaSemanal = metaDiaria * diasTrabalho.length;
    
    somaMetaGeral += metaDiaria;
    somaMetaGeralSemanal += metaSemanal;
    somaTotalFaturas += meta.valor;
    somaTotalProgresso += progressoAtual;

    const [ano, mes, dia] = meta.vencimento.split('-');
    const dataFormatadaBR = `${dia}/${mes}/${ano}`;
    
    const textoDias = diasParaVencer < 0 
      ? `Atrasado há ${Math.abs(diasParaVencer)} ${Math.abs(diasParaVencer) === 1 ? 'dia' : 'dias'}`
      : diasParaVencer === 0 
        ? 'Vence hoje' 
        : `Vence em ${diasParaVencer} ${diasParaVencer === 1 ? 'dia' : 'dias'}`;

    return {
      ...meta,
      textoDias,
      metaDiaria,
      metaSemanal,
      dataFormatadaBR,
      progressoAtual,
      restante,
      porcentagem,
      diasCalculo
    };
  });

  const metasPagasFormatadas = metasPagas.map(meta => {
    const [ano, mes, dia] = meta.vencimento.split('-');
    const dataFormatadaBR = `${dia}/${mes}/${ano}`;
    return { ...meta, dataFormatadaBR };
  });

  let totalFaturasMes = 0;
  let totalProgressoMes = 0;
  filteredMetas.forEach(m => {
    totalFaturasMes += m.valor;
    totalProgressoMes += (m.progresso || 0);
  });

  const progressoTotalMes = totalFaturasMes > 0 ? (totalProgressoMes / totalFaturasMes) * 100 : 0;

  const notifications = metas.filter(m => !m.pago).map(meta => {
    const dataVencimento = new Date(meta.vencimento + 'T00:00:00');
    const diferencaMilissegundos = dataVencimento.getTime() - dataAtual.getTime();
    const diasReais = Math.ceil(diferencaMilissegundos / (1000 * 60 * 60 * 24));
    return { ...meta, diasReais };
  }).filter(m => m.diasReais <= 3).sort((a, b) => a.diasReais - b.diasReais);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center items-start p-4 md:p-8 font-sans antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black">
      <div className="w-full max-w-md mx-auto space-y-8 pb-12 pt-4">
        
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 border border-zinc-800 rounded-2xl mb-2 shadow-2xl">
            <LayoutGrid className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Minhas Metas</h1>
          <p className="text-zinc-400 text-sm">Gerencie e calcule suas metas diárias.</p>
        </header>

        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              {notifications.map(notif => (
                <div key={`notif-${notif.id}`} className={`flex items-start space-x-3 p-4 rounded-2xl border ${notif.diasReais < 0 ? 'bg-red-500/10 border-red-500/30' : notif.diasReais === 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                  <div className={`mt-0.5 ${notif.diasReais < 0 ? 'text-red-400' : notif.diasReais === 0 ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {notif.diasReais < 0 ? <AlertTriangle className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold ${notif.diasReais < 0 ? 'text-red-400' : notif.diasReais === 0 ? 'text-orange-400' : 'text-yellow-400'}`}>
                      {notif.diasReais < 0 ? 'Fatura Atrasada' : notif.diasReais === 0 ? 'Vence Hoje' : `Vence em ${notif.diasReais} ${notif.diasReais === 1 ? 'dia' : 'dias'}`}
                    </h4>
                    <p className="text-zinc-300 text-sm mt-0.5">{notif.descricao} - {notif.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {metas.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
              <div className="flex flex-col items-center text-center space-y-3 relative z-10 mb-6">
                <div className="flex items-center space-x-2 text-zinc-400">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-widest">Meta Diária ({formatPeriodShort(selectedPeriod)})</span>
                </div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600 tracking-tight">
                  {somaMetaGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-2 relative z-10">
                <div className="flex items-center space-x-2 text-zinc-400">
                  <Target className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-widest">Meta Semanal</span>
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-cyan-600 tracking-tight">
                  {somaMetaGeralSemanal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-800/50 pt-5 mt-5">
                <div className="flex items-center space-x-2 text-zinc-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Total em Faturas</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-base font-bold text-zinc-200">
                    {totalFaturasMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-xs text-emerald-500 font-medium mt-0.5">
                    {progressoTotalMes.toFixed(0)}% pago ({totalProgressoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                  </span>
                </div>
              </div>
              <div className="w-full bg-zinc-950/50 h-1.5 mt-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, progressoTotalMes)}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-6 shadow-xl mb-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-zinc-300">
                <CalendarDays className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold tracking-wide">Dias de Trabalho</span>
              </div>
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Folgas Editáveis</span>
            </div>
            
            <div className="flex justify-between items-center w-full gap-2">
              {[
                { id: 0, label: 'D' },
                { id: 1, label: 'S' },
                { id: 2, label: 'T' },
                { id: 3, label: 'Q' },
                { id: 4, label: 'Q' },
                { id: 5, label: 'S' },
                { id: 6, label: 'S' },
              ].map((dia) => {
                const isSelected = diasTrabalho.includes(dia.id);
                return (
                  <button
                    key={dia.id}
                    onClick={() => toggleDiaTrabalho(dia.id)}
                    className={`flex-1 aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105'
                        : 'bg-zinc-950/50 text-zinc-600 border border-zinc-800/80 hover:bg-zinc-900 hover:text-zinc-400'
                    }`}
                  >
                    {dia.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <label htmlFor="descricao" className="flex items-center space-x-2 text-sm font-medium text-zinc-300 mb-2">
              <Tag className="w-4 h-4 text-zinc-500" />
              <span>Tipo de Cobrança</span>
            </label>
            <input
              type="text"
              id="descricao"
              placeholder="Ex: Barbearia, Moto, Internet"
              autoComplete="off"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
            />
          </div>

          <div>
            <label htmlFor="valor" className="flex items-center space-x-2 text-sm font-medium text-zinc-300 mb-2">
              <Wallet className="w-4 h-4 text-zinc-500" />
              <span>Valor Bruto (R$)</span>
            </label>
            <input
              type="text"
              id="valor"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={valorInput}
              onChange={handleValorChange}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateInicio" className="flex items-center space-x-2 text-sm font-medium text-zinc-300 mb-2">
                <CalendarDays className="w-4 h-4 text-zinc-500" />
                <span>Data de Início</span>
              </label>
              <input
                type="date"
                id="dateInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner text-sm [&::-webkit-calendar-picker-indicator]:invert-[0.8] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
            <div>
              <label htmlFor="dateFinal" className="flex items-center space-x-2 text-sm font-medium text-zinc-300 mb-2">
                <CalendarDays className="w-4 h-4 text-zinc-500" />
                <span>Vencimento</span>
              </label>
              <input
                type="date"
                id="dateFinal"
                min={minDate}
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner text-sm [&::-webkit-calendar-picker-indicator]:invert-[0.8] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 cursor-pointer select-none" onClick={() => setRecorrente(!recorrente)}>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${recorrente ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 bg-black/50'}`}>
              {recorrente && <CheckCircle className="w-3.5 h-3.5 text-black" />}
            </div>
            <span className="text-sm font-medium text-zinc-300">Conta recorrente (mensal)</span>
          </div>

          <button
            type="button"
            className="w-full group bg-zinc-100 hover:bg-white text-zinc-950 border border-transparent rounded-xl px-4 py-4 text-sm font-bold transition-all mt-4 flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            onClick={adicionarMeta}
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Adicionar Meta</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex border-b border-zinc-800/50 mb-6">
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors duration-300 ${activeTab === 'ativas' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 rounded-t-xl'}`}
              onClick={() => setActiveTab('ativas')}
            >
              Contas Ativas
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors duration-300 ${activeTab === 'historico' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 rounded-t-xl'}`}
              onClick={() => setActiveTab('historico')}
            >
              Histórico
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors duration-300 ${activeTab === 'grafico' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 rounded-t-xl'}`}
              onClick={() => setActiveTab('grafico')}
            >
              Gráfico
            </button>
          </div>

          {metas.length > 0 && (
            <div className="flex overflow-x-auto pb-2 -mx-2 px-2 space-x-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {periods.map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                    selectedPeriod === period 
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-md scale-105' 
                      : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  {formatPeriod(period)}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {activeTab === 'ativas' && metasComCalculo.length === 0 && metas.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 text-zinc-500 text-sm border-2 border-dashed border-zinc-800/50 rounded-3xl"
              >
                <Target className="w-8 h-8 mx-auto mb-3 opacity-20" />
                Nenhuma meta ativa para este período.
              </motion.div>
            )}

            {activeTab === 'historico' && metasPagasFormatadas.length === 0 && metas.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 text-zinc-500 text-sm border-2 border-dashed border-zinc-800/50 rounded-3xl"
              >
                <CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-20 text-emerald-500" />
                Nenhum pagamento registrado neste período.
              </motion.div>
            )}

            {activeTab === 'ativas' && metasComCalculo.map(meta => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                key={meta.id} 
                className="group bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 shadow-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60"
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors flex items-center space-x-2">
                      <span>{meta.descricao}</span>
                      {meta.recorrente && <RefreshCw className="w-4 h-4 text-emerald-500/70" title="Conta Recorrente" />}
                    </h3>
                    <div className="flex flex-col space-y-1 mt-1">
                      <div className="flex items-center space-x-1.5 text-sm text-zinc-400">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{meta.dataFormatadaBR} <span className="text-zinc-500">({meta.textoDias})</span></span>
                      </div>
                      {meta.diasCalculo && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-zinc-500 font-medium">
                          <Target className="w-3 h-3" />
                          <span>Cálculo baseado em {meta.diasCalculo} {meta.diasCalculo === 1 ? 'dia' : 'dias'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {confirmDeleteId === meta.id ? (
                      <div className="flex items-center space-x-1 bg-red-500/10 rounded-xl px-2 py-1 border border-red-500/20">
                        <span className="text-[10px] uppercase font-bold text-red-400 mr-1">Excluir?</span>
                        <button
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded-md transition-colors"
                          onClick={() => {
                            deletarMeta(meta.id);
                            setConfirmDeleteId(null);
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          className="text-zinc-400 hover:text-zinc-200 p-1 hover:bg-zinc-800 rounded-md transition-colors"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-zinc-500 hover:text-red-400 p-2 rounded-xl transition-all hover:bg-red-400/10 cursor-pointer"
                        onClick={() => setConfirmDeleteId(meta.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="text-xs font-bold text-zinc-400 hover:text-emerald-400 bg-zinc-800/50 hover:bg-emerald-400/10 px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                      onClick={() => marcarComoPago(meta.id)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>PAGO</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-zinc-800/50 pt-5 mt-2">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Fatura (Restante)</span>
                      <span className="text-sm font-semibold text-zinc-300">
                        {meta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                        {meta.restante < meta.valor && (
                          <span className="text-zinc-500 text-xs ml-1">({meta.restante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span>
                        )}
                      </span>
                   </div>
                   <div className="flex flex-col items-end sm:items-center">
                      <span className="text-[11px] font-bold text-cyan-500/70 uppercase tracking-widest mb-1.5">Fazer por Semana</span>
                      <span className="text-xl font-black text-cyan-400 tracking-tight">
                        {meta.metaSemanal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[11px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1.5">Fazer por Dia</span>
                      <span className="text-xl font-black text-emerald-400 tracking-tight">
                        {meta.metaDiaria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                   </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Progresso: {meta.porcentagem}%</span>
                    {addProgressId !== meta.id && (
                      <button 
                        onClick={() => {
                          setAddProgressId(meta.id);
                          const currentProgresso = meta.progresso || 0;
                          setProgressInput(currentProgresso > 0 ? currentProgresso.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
                        }}
                        className="text-zinc-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                        title="Editar valor pago"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="w-full bg-zinc-950 rounded-full h-2 mb-3 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${meta.porcentagem}%` }}></div>
                  </div>

                  <AnimatePresence>
                    {addProgressId === meta.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center space-x-2 mt-2"
                      >
                        <div className="relative flex-1">
                          <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input 
                            type="text" 
                            inputMode="decimal"
                            placeholder="R$ 0,00"
                            value={progressInput}
                            onChange={handleProgressInputChange}
                            className="w-full bg-black border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                          />
                        </div>
                        <button 
                          onClick={() => handleSetProgress(meta.id)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-black px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg active:scale-95"
                        >
                          Salvar
                        </button>
                        <button 
                          onClick={() => setAddProgressId(null)}
                          className="text-zinc-400 hover:text-zinc-200 p-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}

            {activeTab === 'historico' && metasPagasFormatadas.map(meta => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                key={meta.id} 
                className="group bg-zinc-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-3xl p-6 shadow-sm transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-300 line-through decoration-zinc-600 decoration-2 flex items-center space-x-2">
                      <span>{meta.descricao}</span>
                      {meta.recorrente && <RefreshCw className="w-4 h-4 text-emerald-500/50" title="Conta Recorrente" />}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-sm text-zinc-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pago. Venceria em {meta.dataFormatadaBR}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {confirmDeleteId === meta.id ? (
                      <div className="flex items-center space-x-1 bg-red-500/10 rounded-xl px-2 py-1 border border-red-500/20">
                        <span className="text-[10px] uppercase font-bold text-red-400 mr-1">Excluir?</span>
                        <button
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded-md transition-colors"
                          onClick={() => {
                            deletarMeta(meta.id);
                            setConfirmDeleteId(null);
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          className="text-zinc-400 hover:text-zinc-200 p-1 hover:bg-zinc-800 rounded-md transition-colors"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-zinc-600 hover:text-red-400 p-2 rounded-xl transition-all hover:bg-red-400/10 cursor-pointer"
                        onClick={() => setConfirmDeleteId(meta.id)}
                        title="Excluir do Histórico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="text-xs font-bold text-zinc-400 hover:text-emerald-400 bg-zinc-800/50 hover:bg-emerald-400/10 px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                      onClick={() => reverterPagamento(meta.id)}
                      title="Reverter para Ativas"
                    >
                      <span>Reverter</span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-5 flex justify-between items-end border-t border-zinc-800/50 pt-5">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Valor Pago</span>
                      <span className="text-xl font-black text-emerald-500/80 tracking-tight">
                        {meta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                   </div>
                   <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-full">
                     <CheckCircle2 className="w-5 h-5" />
                   </div>
                </div>
              </motion.div>
            ))}

            {activeTab === 'grafico' && filteredMetas.length === 0 && metas.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 text-zinc-500 text-sm border-2 border-dashed border-zinc-800/50 rounded-3xl"
              >
                <PieChartIcon className="w-8 h-8 mx-auto mb-3 opacity-20" />
                Nenhum dado para este período.
              </motion.div>
            )}

            {activeTab === 'grafico' && filteredMetas.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 shadow-sm transition-all"
              >
                <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5 text-cyan-400" />
                  <span>Gastos vs Pagos</span>
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredMetas.map(m => ({
                        name: m.descricao,
                        Fatura: m.valor,
                        Pago: m.pago ? m.valor : (m.progresso || 0)
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5' }}
                        itemStyle={{ color: '#f4f4f5' }}
                        cursor={{ fill: '#27272a', opacity: 0.4 }}
                      />
                      <Bar dataKey="Fatura" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pago" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
