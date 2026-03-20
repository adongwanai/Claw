import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238e8e93' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
};

export function SettingsMemoryStrategy() {
  const [contextConsolidation, setContextConsolidation] = useState(true);
  const [nightlyReflection, setNightlyReflection] = useState(true);

  return (
    <div className="space-y-4">
      {/* 全局长期记忆策略 */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">全局长期记忆策略</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-[#000000]">存储底层</p>
            <select
              className="w-full appearance-none rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] text-[#000000] outline-none focus:border-clawx-ac"
              style={selectStyle}
            >
              <option>Local SQLite + BM25 全文检索 (默认最轻量)</option>
              <option>PostgreSQL + pgvector (云原生)</option>
              <option>Chroma (向量优先)</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-[#000000]">Embeddings 大小与模型</p>
            <select
              className="w-full appearance-none rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] text-[#000000] outline-none focus:border-clawx-ac"
              style={selectStyle}
            >
              <option>text-embedding-3-small (OpenAI, 高性价比)</option>
              <option>text-embedding-3-large (OpenAI, 高精度)</option>
              <option>nomic-embed-text (本地, 免费)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 自动浓缩与总结 */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-1 text-[15px] font-semibold text-[#000000]">自动浓缩与总结</h3>
        <div className="divide-y divide-black/[0.04]">
          <div className="flex items-center justify-between gap-6 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[#000000]">
                多轮对话自动滚动压缩 (Context Consolidation)
              </p>
              <p className="mt-0.5 text-[12px] text-[#8e8e93]">
                当活跃上下文 &gt; 16k tokens 后，提取核心知识覆盖至长记忆并修剪前端。
              </p>
            </div>
            <Switch checked={contextConsolidation} onCheckedChange={setContextConsolidation} />
          </div>
          <div className="flex items-center justify-between gap-6 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[#000000]">
                每日复盘生成 (Nightly Reflection)
              </p>
              <p className="mt-0.5 text-[12px] text-[#8e8e93]">
                利用凌晨系统极低负载时，把昨天的 IM 互动合并梳理到全局画像中。
              </p>
            </div>
            <Switch checked={nightlyReflection} onCheckedChange={setNightlyReflection} />
          </div>
        </div>
      </section>

      {/* 挂载本地目录知识 */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">挂载本地目录知识</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-black/10 bg-[#f9f9f9] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-[#000000]">D:/CompanyDocs/Handbook</p>
              <p className="mt-0.5 text-[12px] text-[#8e8e93]">143 PDFs, 42 MDs</p>
            </div>
            <button
              type="button"
              className="rounded-md border border-black/10 px-2.5 py-1 text-[12px] text-[#3c3c43] hover:bg-[#e5e5ea]"
            >
              重做索引
            </button>
          </div>
          <button
            type="button"
            className="w-full rounded-lg border border-dashed border-black/10 py-2.5 text-[13px] text-[#8e8e93] transition-colors hover:bg-[#f2f2f7]"
          >
            + 添加本地监控目录集
          </button>
        </div>
      </section>
    </div>
  );
}
