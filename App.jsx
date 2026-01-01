import React, { useState, useMemo } from 'react';
import { Search, Shield, Sword, Skull, Zap, Flame, AlertTriangle, Crosshair, Info, Map, Sparkles, CheckCircle2 } from 'lucide-react';

// ==========================================
// 資料設定區域 (重構為 技能+攻略 對照模式)
// ==========================================
const BOSS_DATA = [
  {
    id: 1,
    name: "睡道人 (The Sleeping Daoist)",
    type: "法術 / 召喚",
    dangerLevel: 5,
    imageColor: "from-indigo-600 to-blue-500",
    shadowColor: "shadow-indigo-500/30",
    icon: <Zap className="w-8 h-8 text-white" />,
    weakness: "物理破防 / 控制抵銷",
    skills: [
      {
        name: "漂浮術 (核心機制)",
        desc: "點名一名玩家強制升空，落下時造成秒殺傷害。",
        strategy: "必須由另一名隊友主動踩「變體法陣」變成蟲子，移動去接住漂浮中的隊友。<br/><span class='text-yellow-400'>★ 技巧：</span>被點名者在讀條結束前可用「神龍吐火」免疫漂浮。"
      },
      {
        name: "變體法陣",
        desc: "攔截坦克並在原地產生一個漩渦，誤觸會變成蟲子無法攻擊。",
        strategy: "坦克將 BOSS 拉離漩渦，其他人不要去碰（除非要去接漂浮的隊友）。"
      },
      {
        name: "藤牢術",
        desc: "藤蔓強制束縛定身，持續扣血。可能指定兩人需站在一起。",
        strategy: "隊友集中火力打掉藤蔓救人。<br/><span class='text-yellow-400'>★ 技巧：</span>讀條快結束時可用「金玉手」免疫中招。"
      },
      {
        name: "閃爍爆桶 & 身上賣圈",
        desc: "場上爆桶互靠太近會連鎖爆炸（3個即滅團）；身上帶圈者會引爆四周爆桶。",
        strategy: "搬離正在閃爍的爆桶，待停止後放下。被點名帶圈者請遠離爆桶堆。若隊伍血量健康，可戰術性引爆獨立爆桶以減少數量。"
      },
      {
        name: "幻驅",
        desc: "召喚大量的蟲子在場上。",
        strategy: "需限時消滅，建議保留「百鬼打穴手」等大範圍 AOE 技能快速清場。"
      }
    ]
  },
  {
    id: 2,
    name: "容鷲 (Rong Jiu)",
    type: "火屬性 / 物理",
    dangerLevel: 5,
    imageColor: "from-orange-600 to-red-500",
    shadowColor: "shadow-orange-500/30",
    icon: <Flame className="w-8 h-8 text-white" />,
    weakness: "水屬性 / 遠程風箏",
    skills: [
      {
        name: "火海指令 (生存關鍵)",
        desc: "引爆全場爆桶造成高額 AOE，僅最右邊有安全區域。",
        strategy: "坦克將 BOSS 拉至最右邊安全區並開「無相金身」，奶媽預讀群補。<br/><span class='text-yellow-400'>★ 技巧：</span>若火海中有太多閃爍爆桶，需提前搬運部分至安全區以免被引爆。"
      },
      {
        name: "召喚炎鳥",
        desc: "炎鳥在原地讀條，造成黃色大範圍爆炸。",
        strategy: "優先集火擊殺炎鳥，或是迅速將其周圍的爆桶搬走。"
      },
      {
        name: "燃燒之刃",
        desc: "BOSS 攻擊帶火屬性，砍到爆桶會立刻引爆。",
        strategy: "坦克務必將 BOSS 拉至空曠處，隊友協助清理場地上的爆桶，避免 BOSS 誤觸。"
      },
      {
        name: "斷絕",
        desc: "產生護盾並對坦克進行高強度的輸出檢測。",
        strategy: "所有隊友集合在 BOSS 身邊，全力輸出打破護盾。"
      }
    ]
  }
];

// ==========================================
// 元件區域
// ==========================================

const StarRating = ({ level }) => {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-4 rounded-sm transform skew-x-[-12deg] ${
            i < level ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "bg-slate-700"
          }`}
        />
      ))}
    </div>
  );
};

const SkillCard = ({ skill, index }) => {
  return (
    <div className="relative pl-6 pb-8 border-l-2 border-slate-700 last:border-0 last:pb-0">
      {/* 連接點 */}
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
      
      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors">
        {/* 技能標題區 */}
        <div className="p-4 border-b border-slate-800/50 bg-slate-800/30 flex items-start gap-3">
          <div className="mt-1 p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-200">{skill.name}</h4>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">{skill.desc}</p>
          </div>
        </div>

        {/* 應對策略區 */}
        <div className="p-4 bg-gradient-to-r from-blue-900/10 to-transparent">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
               <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                 攻略對策
               </h5>
               <div 
                 className="text-sm text-slate-300 leading-relaxed"
                 dangerouslySetInnerHTML={{ __html: skill.strategy }}
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BossCard = ({ boss }) => {
  return (
    <div className={`group relative bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 transition-all duration-300 hover:shadow-2xl hover:${boss.shadowColor} backdrop-blur-md`}>
      {/* 頂部彩色漸層背景 */}
      <div className={`h-32 w-full bg-gradient-to-r ${boss.imageColor} relative overflow-hidden`}>
         {/* 裝飾圖案 */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
         
         <div className="absolute bottom-4 left-6 flex items-end justify-between w-[calc(100%-3rem)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border-2 border-white/10 flex items-center justify-center shadow-xl backdrop-blur-sm">
                {boss.icon}
              </div>
              <div className="mb-1">
                <h3 className="text-2xl font-bold text-white shadow-black drop-shadow-md">
                  {boss.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded text-white/90 bg-black/30 border border-white/20 backdrop-blur-md">
                    {boss.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end mb-1">
               <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest mb-1">Danger Level</span>
               <StarRating level={boss.dangerLevel} />
            </div>
         </div>
      </div>

      <div className="p-6">
        {/* 弱點提示 */}
        <div className="mb-8 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center gap-3">
           <Crosshair size={18} className="text-purple-400" />
           <span className="text-sm text-slate-400">建議弱點打擊：<span className="text-purple-300 font-medium">{boss.weakness}</span></span>
        </div>

        {/* 技能列表 (時間軸樣式) */}
        <div className="mt-4">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Sparkles size={14} /> 戰鬥機制解析
          </h4>
          <div className="space-y-2">
            {boss.skills.map((skill, index) => (
              <SkillCard key={index} skill={skill} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredBosses = useMemo(() => {
    return BOSS_DATA.filter(boss => {
      const matchesSearch = boss.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            boss.skills.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = activeTab === "all" || boss.type.includes(activeTab);
      return matchesSearch && matchesType;
    });
  }, [searchTerm, activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* 頂部導航 */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Sword size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                BossGuide<span className="text-blue-500">.Pro</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4 text-sm font-medium text-slate-400">
              <span className="hover:text-white cursor-pointer transition-colors">副本列表</span>
              <span className="text-white cursor-pointer border-b-2 border-blue-500 pb-0.5">雲夢金明池</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
        {/* 背景圖片 */}
        <div className="absolute inset-0 bg-slate-900">
             <img 
               src="https://truth.bahamut.com.tw/s01/202512/forum/75703/4c52ebbdcc56f2474f82cc08706ec801.JPG" 
               alt="雲夢金明池" 
               className="w-full h-full object-cover object-center opacity-70"
             />
             {/* 漸層遮罩 */}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>
        
        {/* Banner 文字內容 */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-7xl mx-auto flex flex-col justify-end h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-400 font-bold tracking-wider uppercase text-xs md:text-sm bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 backdrop-blur-md">
                團隊副本 Raid Instance
              </span>
              <span className="text-yellow-500 font-bold tracking-wider uppercase text-xs md:text-sm bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 backdrop-blur-md flex items-center gap-1">
                <AlertTriangle size={12} /> 高難度
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              雲夢金明池
            </h1>
            <p className="text-slate-300 max-w-2xl text-lg drop-shadow-md flex items-center gap-2">
               <Map size={18} className="text-blue-400" />
               深入夢境與現實的交界，掌握「睡道人」與「容鷲」的機制，突破極限。
            </p>
        </div>
      </div>

      {/* 主要內容區 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* 功能列：標題 & 搜尋 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2">
             <Shield className="text-blue-500 w-6 h-6" />
             <h2 className="text-2xl font-bold text-white">首領情報</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
             {/* 篩選標籤 */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {["all", "火屬性", "法術", "物理"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all border ${
                      activeTab === tab 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                >
                  {tab === "all" ? "全部" : tab}
                </button>
              ))}
            </div>

            {/* 搜尋框 */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="搜尋關鍵字..."
                className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-600 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 卡片網格 */}
        {filteredBosses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredBosses.map((boss) => (
              <BossCard key={boss.id} boss={boss} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
             <Info size={48} className="mx-auto text-slate-600 mb-4" />
             <h3 className="text-xl font-medium text-slate-400">找不到相符的 BOSS</h3>
             <p className="text-slate-500 mt-2">請嘗試搜尋其他關鍵字</p>
          </div>
        )}

        {/* 底部資訊 */}
        <footer className="mt-20 border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          <p>© 2024 BossGuide.Pro - 雲夢金明池攻略資料庫</p>
        </footer>
      </main>
    </div>
  );
};

export default App;