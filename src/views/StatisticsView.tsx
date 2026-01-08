/**
 * StatisticsView - Componente lazy-loaded com todos os gráficos
 * Contém Recharts (~350KB) que só é carregado quando esta view está ativa
 */
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ComposedChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Activity,
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart3,
  Hexagon,
  TrendingUp,
  AlignLeft,
} from 'lucide-react';

import { COLORS, getHeatmapColors, ICON_SOLID_STYLE } from '../lib/theme';
import { formatDurationDetailed, formatAxisTick, triggerHaptic, getRangeLabel } from '../lib/helpers';
import type { CustomTickProps, TimeRange, SortOrder } from '../types';

// Tipos para os dados (espelhando App.tsx stats)
interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  hours: string;
  [key: string]: string | number; // Index signature for Recharts
}

interface HeatmapDataItem {
  date: string;
  count: number;
  level: number;
  isGoalMet: boolean;
}

interface ComparativeDataItem {
  name: string;
  Atual: number;
  Anterior: number;
}

interface DailyRhythmDataItem {
  date: string;
  minutes: number;
  ma: number;
}

interface LineChartDataItem {
  date: string;
  accumulated: number;
  reference: number;
}

interface EvolutionReportItem {
  days: number;
  label: string;
  current: string;
  prev: string;
  currentRaw: number;
  prevRaw: number;
  percent: number | null;
  trend: 'up' | 'down' | 'neutral';
}

interface StatsData {
  heatmapData: HeatmapDataItem[];
  evolutionReport: EvolutionReportItem[];
  comparativeData: ComparativeDataItem[];
  dailyRhythmData: DailyRhythmDataItem[];
  lineChartData: LineChartDataItem[];
  pieAllData: ChartDataItem[];
  pieLegendData: ChartDataItem[];
  radarData: ChartDataItem[];
  barChartData: ChartDataItem[];
  listData: ChartDataItem[];
  rhythmDeviationPercent: number;
  accumulatedDeviationPercent: number;
}

interface ThemeClasses {
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  input: string;
  accent: string;
  accentText: string;
  accentBg: string;
  danger: string;
  success: string;
}

interface StatisticsViewProps {
  isDarkMode: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any; // Flexible type to match App.tsx useMemo return
  THEME: ThemeClasses;
  heatmapYear: number;
  setHeatmapYear: React.Dispatch<React.SetStateAction<number>>;
  timeRange: TimeRange;
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
  lineChartRange: TimeRange;
  setLineChartRange: React.Dispatch<React.SetStateAction<TimeRange>>;
  dailyRhythmRange: TimeRange;
  setDailyRhythmRange: React.Dispatch<React.SetStateAction<TimeRange>>;
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  chartType: 'pie' | 'radar' | 'bar';
  setChartType: React.Dispatch<React.SetStateAction<'pie' | 'radar' | 'bar'>>;
}

// Custom tick components
const createCustomYAxisTick = (isDarkMode: boolean) => {
  return ({ x = 0, y = 0, payload }: CustomTickProps) => {
    const text = String(payload?.value ?? '');
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';
    for (let i = 1; i < words.length; i++) {
      if (currentLine.length + words[i].length < 18) {
        currentLine += ' ' + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={-5}
            y={index * 10 - (lines.length - 1) * 5}
            dy={3}
            textAnchor='end'
            fill={isDarkMode ? '#a3a3a3' : '#64748b'}
            fontSize={10}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };
};

const createCustomRadarTick = (isDarkMode: boolean) => {
  return ({ payload, x = 0, y = 0, textAnchor }: CustomTickProps) => {
    const text = String(payload?.value ?? '');
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';
    for (let i = 1; i < words.length; i++) {
      if (currentLine.length + words[i].length < 15) {
        currentLine += ' ' + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);

    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={index * 10}
            dy={0}
            textAnchor={textAnchor}
            fill={isDarkMode ? '#e5e5e5' : '#334155'}
            fontSize={9}
            fontWeight={500}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };
};

const StatisticsView: React.FC<StatisticsViewProps> = ({
  isDarkMode,
  stats,
  THEME,
  heatmapYear,
  setHeatmapYear,
  timeRange,
  setTimeRange,
  lineChartRange,
  setLineChartRange,
  dailyRhythmRange,
  setDailyRhythmRange,
  sortOrder,
  setSortOrder,
  chartType,
  setChartType,
}) => {

  const HEATMAP_COLORS = getHeatmapColors(isDarkMode);
  const CustomYAxisTick = createCustomYAxisTick(isDarkMode);
  const CustomRadarTick = createCustomRadarTick(isDarkMode);

  const renderPieLegend = () => (
    <ul
      className={`flex flex-wrap justify-center gap-2 mt-4 text-xs ${THEME.textMuted}`}
    >
      {(stats.pieLegendData || []).map((entry: ChartDataItem, index: number) => (
        <li key={index} className='flex items-center gap-1'>
          <span
            className='w-3 h-3 rounded-sm'
            style={{
              backgroundColor:
                entry.name === 'Outras Matérias'
                  ? '#525252'
                  : COLORS[index % COLORS.length],
            }}
          ></span>
          <span className='truncate max-w-[100px]'>{entry.name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className='space-y-6 animate-in fade-in duration-300 ease-out'>
      {/* HEATMAP */}
      <div className={`${THEME.card} p-5 rounded-2xl border shadow-sm w-full`}>
        <div className='flex justify-between items-center mb-6'>
          <h3 className={`font-bold ${THEME.text} flex items-center gap-2`}>
            <Activity className='h-5 w-5' style={ICON_SOLID_STYLE} /> Frequência de Estudo
          </h3>
          <div className={`flex items-center gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'}`}>
            <span className='text-xs font-bold px-2'>{heatmapYear}</span>
          </div>
        </div>

        <div
          className='flex justify-start w-full gap-1 flex-wrap content-start'
          style={{ maxHeight: '200px', overflowY: 'hidden' }}
        >
          {(stats.heatmapData || []).map((day: HeatmapDataItem, idx: number) => (
            <div
              key={idx}
              title={`${new Date(day.date).toLocaleDateString()}: ${formatDurationDetailed(day.count)}`}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-[1px] transition-all duration-300 hover:scale-125 ${
                day.isGoalMet ? 'border border-[#EAB308] shadow-[0_0_5px_#EAB308]' : ''
              }`}
              style={{ backgroundColor: HEATMAP_COLORS[day.level] }}
            ></div>
          ))}
        </div>
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setHeatmapYear((y) => y - 1)}
              aria-label="Ano anterior"
              className={`p-1 rounded ${THEME.textMuted} hover:bg-neutral-800`}
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
            <span className={`text-xs font-bold ${THEME.text}`}>{heatmapYear}</span>
            <button
              onClick={() => setHeatmapYear((y) => y + 1)}
              aria-label="Próximo ano"
              className={`p-1 rounded ${THEME.textMuted} hover:bg-neutral-800`}
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
          <div className='flex items-center gap-2 text-[10px] text-slate-400'>
            <span>-</span>
            <div className='flex gap-1'>
              {HEATMAP_COLORS.map((c) => (
                <div key={c} className='w-2 h-2 rounded-[1px]' style={{ backgroundColor: c }}></div>
              ))}
            </div>
            <span>+</span>
          </div>
        </div>
      </div>

      {/* EVOLUTION TABLE */}
      <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
        <h3 className={`font-bold ${THEME.text} flex items-center gap-2 mb-4`}>
          <TrendingUp className='h-5 w-5' style={ICON_SOLID_STYLE} /> Relatório de Evolução
        </h3>
        <div className='overflow-x-auto -mx-2 px-2 hide-scrollbar'>
          <table className='w-full text-xs sm:text-sm'>
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-neutral-800' : 'border-slate-200'}`}>
                <th className={`py-2 text-left font-bold ${THEME.textMuted}`}>Período</th>
                <th className={`py-2 text-center font-bold ${THEME.textMuted}`}>Anterior</th>
                <th className={`py-2 text-center font-bold ${THEME.textMuted}`}>Atual</th>
                <th className={`py-2 text-right font-bold ${THEME.textMuted}`}>Δ%</th>
              </tr>
            </thead>
            <tbody>
              {(stats.evolutionReport || []).map((row: EvolutionReportItem) => (
                <tr key={row.days} className={`border-b ${isDarkMode ? 'border-neutral-800' : 'border-slate-200'}`}>
                  <td className={`py-2.5 font-bold ${THEME.text}`}>{row.label}</td>
                  <td className={`py-2.5 text-center ${THEME.textMuted}`}>{row.prev}</td>
                  <td className='py-2.5 text-center'>
                    <span className='font-bold bg-gradient-to-br from-[#FDE047] to-[#EAB308] bg-clip-text text-transparent'>
                      {row.current}
                    </span>
                  </td>
                  <td
                    className={`py-2.5 text-right font-bold flex items-center justify-end gap-1 ${
                      row.trend === 'up' ? 'text-green-500' : row.trend === 'down' ? 'text-red-500' : THEME.textMuted
                    }`}
                  >
                    {row.percent === null ? 'N/A' : `${row.percent > 0 ? '+' : ''}${row.percent}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPARATIVE CHART */}
      <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
        <h3 className={`font-bold ${THEME.text} flex items-center gap-2 mb-6`}>
          <ChartColumn className='h-5 w-5' style={ICON_SOLID_STYLE} /> Comparativo de Períodos
        </h3>
        <div className='w-full h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={stats.comparativeData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
              <defs>
                <linearGradient id='chartGradient' x1='0' y1='0' x2='1' y2='0'>
                  <stop offset='0%' stopColor='#FDE047' />
                  <stop offset='100%' stopColor='#EAB308' />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke={isDarkMode ? '#333' : '#eee'} />
              <XAxis
                dataKey='name'
                tick={{ fontSize: 10, fill: isDarkMode ? '#888' : '#666' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDarkMode ? '#888' : '#666' }}
                tickFormatter={formatAxisTick}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                formatter={(value: number, name: string) => [formatDurationDetailed(value), name]}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#171717' : '#fff',
                  borderColor: isDarkMode ? '#333' : '#eee',
                }}
                itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
              />
              <Bar dataKey='Anterior' fill={isDarkMode ? '#525252' : '#cbd5e1'} radius={[4, 4, 0, 0]} />
              <Bar dataKey='Atual' fill='url(#chartGradient)' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DAILY RHYTHM */}
      <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm relative`}>
        <div className='flex justify-between items-center mb-4 flex-wrap gap-2 pr-0 sm:pr-8 md:pr-24'>
          <div className='flex items-center gap-2'>
            <h3 className={`font-bold ${THEME.text} flex items-center gap-2`}>
              <Activity className='h-5 w-5' style={ICON_SOLID_STYLE} /> Ritmo Diário
            </h3>
          </div>
          <div className={`flex p-1 rounded-lg text-xs overflow-x-auto max-w-full hide-scrollbar ${isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'}`}>
            {(['7_days', '14_days', '30_days', '90_days', '180_days', '360_days'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => { setDailyRhythmRange(r); triggerHaptic(); }}
                className={`px-2 py-1 rounded transition font-bold whitespace-nowrap ${
                  dailyRhythmRange === r
                    ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                    : `${THEME.textMuted}`
                }`}
              >
                {r.replace('_days', 'd')}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`absolute top-6 right-6 text-xs font-bold flex items-center gap-1 ${
            stats.rhythmDeviationPercent >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {stats.rhythmDeviationPercent > 0 ? '+' : ''}
          {stats.rhythmDeviationPercent}%
          {stats.rhythmDeviationPercent >= 0 ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />}
        </div>
        <div className='w-full h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={stats.dailyRhythmData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
              <defs>
                <linearGradient id='chartGradient' x1='0' y1='0' x2='1' y2='0'>
                  <stop offset='0%' stopColor='#FDE047' />
                  <stop offset='100%' stopColor='#EAB308' />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke={isDarkMode ? '#333' : '#eee'} />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 9, fill: isDarkMode ? '#888' : '#666' }}
                interval='preserveStartEnd'
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDarkMode ? '#888' : '#666' }}
                tickFormatter={formatAxisTick}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#171717' : '#fff',
                  borderColor: isDarkMode ? '#333' : '#eee',
                }}
                itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
              />
              <Bar dataKey='minutes' fill={isDarkMode ? '#333' : '#e2e8f0'} radius={[4, 4, 0, 0]} name='Minutos' />
              <Line type='monotone' dataKey='ma' stroke='url(#chartGradient)' strokeWidth={2} dot={false} name='Média' />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE CHART - Accumulated */}
      <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm relative`}>
        <div className='flex justify-between items-center mb-6 flex-wrap gap-2 pr-0 sm:pr-8 md:pr-24'>
          <div className='flex items-center gap-2'>
            <h3 className={`font-bold ${THEME.text} flex items-center gap-2`}>
              <LineChartIcon className='h-5 w-5' style={ICON_SOLID_STYLE} /> Estudo Acumulado
            </h3>
          </div>
          <div className={`flex p-1 rounded-lg text-xs overflow-x-auto max-w-full hide-scrollbar ${isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'}`}>
            {(['7_days', '14_days', '30_days', '90_days', '180_days', '360_days'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => { setLineChartRange(r); triggerHaptic(); }}
                className={`px-2 py-1 rounded transition font-bold whitespace-nowrap ${
                  lineChartRange === r
                    ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                    : `${THEME.textMuted}`
                }`}
              >
                {r.replace('_days', 'd')}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`absolute top-6 right-6 text-xs font-bold flex items-center gap-1 ${
            stats.accumulatedDeviationPercent >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {stats.accumulatedDeviationPercent > 0 ? '+' : ''}
          {stats.accumulatedDeviationPercent}%
          {stats.accumulatedDeviationPercent >= 0 ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />}
        </div>
        <div className='w-full h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={stats.lineChartData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
              <defs>
                <linearGradient id='chartGradient' x1='0' y1='0' x2='1' y2='0'>
                  <stop offset='0%' stopColor='#FDE047' />
                  <stop offset='100%' stopColor='#EAB308' />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke={isDarkMode ? '#333' : '#eee'} />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 9, fill: isDarkMode ? '#888' : '#666' }}
                interval='preserveStartEnd'
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDarkMode ? '#888' : '#666' }}
                tickFormatter={formatAxisTick}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                formatter={(val: number, name: string) => [
                  formatDurationDetailed(val),
                  name === 'reference' ? 'Meta (3h/dia)' : 'Realizado',
                ]}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#171717' : '#fff',
                  borderColor: isDarkMode ? '#333' : '#eee',
                }}
                itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
              />
              <Line
                type='linear'
                dataKey='reference'
                stroke={isDarkMode ? '#555' : '#cbd5e1'}
                strokeWidth={2}
                strokeOpacity={0.5}
                dot={false}
                activeDot={false}
              />
              <Line
                type='linear'
                dataKey='accumulated'
                stroke='url(#chartGradient)'
                strokeWidth={2}
                dot={{ r: 0 }}
                activeDot={{ r: 4, fill: 'url(#chartGradient)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DISTRIBUTION CHARTS */}
      <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
        <div className='flex justify-between items-center mb-4 gap-2'>
          <h3 className={`font-bold ${THEME.text} flex items-center gap-2 text-sm sm:text-base`}>
            <PieChartIcon className='h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0' style={ICON_SOLID_STYLE} /> Distribuição por Matéria
          </h3>
          <div className={`flex p-0.5 gap-0.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'}`}>
            <button
              onClick={() => { setChartType('pie'); triggerHaptic(); }}
              className={`p-1.5 rounded ${
                chartType === 'pie'
                  ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                  : `${THEME.textMuted}`
              }`}
            >
              <PieChartIcon className='h-3.5 w-3.5' />
            </button>
            <button
              onClick={() => { setChartType('radar'); triggerHaptic(); }}
              className={`p-1.5 rounded ${
                chartType === 'radar'
                  ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                  : `${THEME.textMuted}`
              }`}
            >
              <Hexagon className='h-3.5 w-3.5' />
            </button>
            <button
              onClick={() => { setChartType('bar'); triggerHaptic(); }}
              className={`p-1.5 rounded ${
                chartType === 'bar'
                  ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                  : `${THEME.textMuted}`
              }`}
            >
              <BarChart3 className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>

        {stats.listData.length > 0 ? (
          <div
            className='w-full'
            style={{
              height: chartType === 'bar' ? Math.max(350, stats.barChartData.length * 50) : 350,
            }}
          >
            <ResponsiveContainer width='100%' height='100%'>
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={stats.pieAllData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey='value'
                    stroke='none'
                  >
                    {(stats.pieAllData || []).map((entry: ChartDataItem, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatDurationDetailed(value)}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#171717' : '#fff',
                      borderColor: isDarkMode ? '#333' : '#eee',
                    }}
                    itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                  />
                  <Legend content={renderPieLegend} verticalAlign='bottom' />
                </PieChart>
              ) : chartType === 'radar' && stats.radarData.length > 0 ? (
                <RadarChart cx='50%' cy='50%' outerRadius='65%' data={stats.radarData}>
                  <defs>
                    <linearGradient id='chartGradient' x1='0' y1='0' x2='1' y2='0'>
                      <stop offset='0%' stopColor='#FDE047' />
                      <stop offset='100%' stopColor='#EAB308' />
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke={isDarkMode ? '#333' : '#eee'} />
                  <PolarAngleAxis
                    dataKey='name'
                    tick={(props) => <CustomRadarTick {...(props as unknown as CustomTickProps)} />}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tickFormatter={formatAxisTick} tick={false} axisLine={false} />
                  <Radar
                    name='Tempo'
                    dataKey='value'
                    stroke='url(#chartGradient)'
                    strokeWidth={2}
                    fill='url(#chartGradient)'
                    fillOpacity={0.4}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => formatDurationDetailed(value)}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#171717' : '#fff',
                      borderColor: isDarkMode ? '#333' : '#eee',
                    }}
                    itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                  />
                </RadarChart>
              ) : chartType === 'bar' ? (
                <BarChart data={stats.barChartData} layout='vertical' margin={{ left: 15, right: 15 }}>
                  <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke={isDarkMode ? '#333' : '#eee'} />
                  <XAxis type='number' hide />
                  <YAxis
                    type='category'
                    dataKey='name'
                    width={100}
                    tick={(props) => <CustomYAxisTick {...(props as unknown as CustomTickProps)} />}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => formatDurationDetailed(value)}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#171717' : '#fff',
                      borderColor: isDarkMode ? '#333' : '#eee',
                    }}
                    itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                  />
                  <Bar dataKey='value' radius={[0, 4, 4, 0]}>
                    {(stats.barChartData || []).map((entry: ChartDataItem, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === 'Outras Matérias' ? '#525252' : COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <div />
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='h-64 flex flex-col items-center justify-center text-neutral-500'>
            <p>Sem dados.</p>
          </div>
        )}
      </div>

      {/* DETAILED LIST */}
      <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
        <div className='flex justify-between items-center mb-4'>
          <h3 className={`font-bold ${THEME.text} flex items-center gap-2`}>
            <AlignLeft className='h-5 w-5' style={ICON_SOLID_STYLE} /> Lista Detalhada
          </h3>
          <button
            onClick={() => { setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); triggerHaptic(); }}
            className={`p-2 rounded-lg ${THEME.textMuted} hover:bg-neutral-800`}
            aria-label={sortOrder === 'desc' ? 'Ordenar crescente' : 'Ordenar decrescente'}
          >
            {sortOrder === 'desc' ? (
              <ArrowDownWideNarrow className='h-4 w-4' />
            ) : (
              <ArrowUpWideNarrow className='h-4 w-4' />
            )}
          </button>
        </div>
        <div className='space-y-0 max-h-96 overflow-y-auto hide-scrollbar'>
          {(stats.listData || []).map((item: ChartDataItem, index: number) => (
            <div
              key={index}
              className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-neutral-800' : 'border-slate-200'} last:border-b-0`}
            >
              <div className='flex items-center gap-3 overflow-hidden'>
                <div className='w-2.5 h-2.5 rounded-sm shrink-0' style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className={`text-sm font-medium truncate max-w-[140px] sm:max-w-[220px] ${THEME.text}`}>{item.name}</span>
              </div>
              <div className='flex gap-1.5 text-xs font-bold shrink-0 items-center'>
                <span className={`px-1.5 py-0.5 rounded whitespace-nowrap ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-white text-slate-600 border'}`}>
                  {item.hours}
                </span>
                <span className='px-1.5 py-0.5 bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black rounded min-w-[2.5rem] text-center'>
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
