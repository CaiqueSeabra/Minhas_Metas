import React, { useState, useEffect } from 'react';

interface Meta {
  id: number;
  descricao: string;
  valor: number;
  vencimento: string;
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
  const [dataFinal, setDataFinal] = useState('');
  
  const today = new Date();
  const currentPeriodDefaultStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriodDefaultStr);

  useEffect(() => {
    localStorage.setItem('metas_carlos', JSON.stringify(metas));
  }, [metas]);

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
      vencimento: dataFinal
    };

    setMetas([...metas, novaMeta]);
    setDescricao('');
    setValorInput('');
    setSelectedPeriod(dataFinal.substring(0, 7));
  };

  const deletarMeta = (id: number) => {
    setMetas(metas.filter(m => m.id !== id));
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
  const dataAtual = new Date();
  dataAtual.setHours(0, 0, 0, 0);

  const filteredMetas = metas.filter(m => m.vencimento.startsWith(selectedPeriod));

  const metasComCalculo = filteredMetas.map(meta => {
    const dataVencimento = new Date(meta.vencimento + 'T00:00:00');
    const diferencaMilissegundos = dataVencimento.getTime() - dataAtual.getTime();
    let diferencaDias = Math.ceil(diferencaMilissegundos / (1000 * 60 * 60 * 24));
    
    if (diferencaDias <= 0) diferencaDias = 1;
    
    const metaDiaria = meta.valor / diferencaDias;
    somaMetaGeral += metaDiaria;
    somaTotalFaturas += meta.valor;

    const [ano, mes, dia] = meta.vencimento.split('-');
    const dataFormatadaBR = `${dia}/${mes}/${ano}`;

    return {
      ...meta,
      diferencaDias,
      metaDiaria,
      dataFormatadaBR
    };
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center items-start p-4 md:p-8 font-sans antialiased">
      <div className="w-full max-w-md mx-auto space-y-6 pb-12">
        <header className="pt-6 pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Minhas Metas</h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie e calcule suas metas diárias.</p>
        </header>

        {metas.length > 0 && (
          <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-xl p-6 shadow-sm">
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Meta Diária ({formatPeriodShort(selectedPeriod)})</div>
              <div className="text-4xl font-bold text-emerald-400 tracking-tight">
                {somaMetaGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-zinc-800/50 pt-4 mt-2">
              <span className="text-sm font-medium text-zinc-400">Total em Faturas:</span>
              <span className="text-base font-bold text-zinc-200">
                {somaTotalFaturas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-zinc-300 mb-1.5">Tipo de Cobrança</label>
            <input
              type="text"
              id="descricao"
              placeholder="Ex: Barbearia, Moto, Internet"
              autoComplete="off"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-zinc-300 mb-1.5">Valor Bruto (R$)</label>
            <input
              type="text"
              id="valor"
              inputMode="decimal"
              placeholder="0,00"
              value={valorInput}
              onChange={handleValorChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="dateFinal" className="block text-sm font-medium text-zinc-300 mb-1.5">Data de Vencimento</label>
            <input
              type="date"
              id="dateFinal"
              min={minDate}
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
            />
          </div>

          <button
            type="button"
            className="w-full bg-zinc-100 hover:bg-white text-zinc-900 border border-transparent rounded-lg px-4 py-3.5 text-sm font-semibold transition-colors mt-2"
            onClick={adicionarMeta}
          >
            Adicionar Meta
          </button>
        </div>

        <div className="space-y-4">
          {metas.length > 0 && (
            <div className="flex overflow-x-auto pb-2 -mx-2 px-2 space-x-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {periods.map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    selectedPeriod === period 
                      ? 'bg-zinc-100 text-zinc-900 border-zinc-100' 
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {formatPeriod(period)}
                </button>
              ))}
            </div>
          )}

          {metasComCalculo.length === 0 && metas.length > 0 && (
            <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
              Nenhuma meta para este mês.
            </div>
          )}

          {metasComCalculo.map(meta => (
            <div key={meta.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm transition-all hover:border-zinc-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">{meta.descricao}</h3>
                  <div className="text-sm text-zinc-400 mt-0.5">Vence em {meta.dataFormatadaBR} ({meta.diferencaDias} {meta.diferencaDias === 1 ? 'dia' : 'dias'})</div>
                </div>
                <button
                  className="text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                  onClick={() => deletarMeta(meta.id)}
                >
                  PAGO
                </button>
              </div>
              
              <div className="flex items-center justify-between border-t border-zinc-800/50 pt-4 mt-2">
                 <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total da Fatura</span>
                    <span className="text-sm font-medium text-zinc-300">
                      {meta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Fazer por Dia</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {meta.metaDiaria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
