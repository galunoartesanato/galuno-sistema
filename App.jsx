import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";

// ---------- helpers ----------
const BRL = (v) =>
  isFinite(v) ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
const BRL4 = (v) =>
  isFinite(v)
    ? "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    : "—";
const KG = (v) => (isFinite(v) ? v.toLocaleString("pt-BR", { maximumFractionDigits: 3 }) + " kg" : "—");
const uid = () => Math.random().toString(36).slice(2, 9);
const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return isNaN(n) ? 0 : n;
};

const CATEGORIAS = ["Matéria-prima", "Acabamento", "Embalagem", "Produção", "Outros"];

// ---------- dados iniciais ----------
const INSUMOS_SEED = [{"id":"imp0","codigo":"MDF2,5","descricao":"MDF 2,5MM 244X185 (Arauco)","categoria":"Matéria-prima","unidCompra":"m²","preco":8.504652,"rendimento":1,"unidUso":"m²","fornecedorId":"forn0"},{"id":"imp1","codigo":"MDF4","descricao":"MDF 4MM 275x185 (Arauco)","categoria":"Matéria-prima","unidCompra":"m²","preco":13.383784,"rendimento":1,"unidUso":"m²","fornecedorId":"forn0"},{"id":"imp2","codigo":"MDF6","descricao":"MDF 6MM 275X185 (Arauco)","categoria":"Matéria-prima","unidCompra":"m²","preco":18.140541,"rendimento":1,"unidUso":"m²","fornecedorId":"forn0"},{"id":"imp3","codigo":"MDF9","descricao":"MDF 9MM 275X185 (Arauco)","categoria":"Matéria-prima","unidCompra":"m²","preco":23.762162,"rendimento":1,"unidUso":"m²","fornecedorId":"forn0"},{"id":"imp4","codigo":"MDF2,5BRANCO","descricao":"MDF 2,5MM LAMINADO BRANCO 244X185 (Arauco)","categoria":"Matéria-prima","unidCompra":"m²","preco":15.815241,"rendimento":1,"unidUso":"m²","fornecedorId":"forn0"},{"id":"imp5","codigo":"FLYER","descricao":"FLYERS MANUAL + AGRADECIMENTO","categoria":"Outros","unidCompra":"un","preco":0.08,"rendimento":1,"unidUso":"un","fornecedorId":"forn1"},{"id":"imp6","codigo":"EMB1","descricao":"ENVELOPE CILINDRO","categoria":"Embalagem","unidCompra":"un","preco":1.25,"rendimento":1,"unidUso":"un","fornecedorId":"forn2"},{"id":"imp7","codigo":"EMB2","descricao":"ENVELOPE 19X25CM","categoria":"Embalagem","unidCompra":"un","preco":0.1,"rendimento":1,"unidUso":"un","fornecedorId":"forn2"},{"id":"imp8","codigo":"EMB3","descricao":"ENVELOPE 60X60CM","categoria":"Embalagem","unidCompra":"un","preco":0.64,"rendimento":1,"unidUso":"un","fornecedorId":"forn2"},{"id":"imp9","codigo":"BOLHA","descricao":"PLÁSTICO BOLHA 1,30M X 100MT","categoria":"Embalagem","unidCompra":"un","preco":0.56,"rendimento":1,"unidUso":"un","fornecedorId":"forn2"},{"id":"imp10","codigo":"ETIQUETA","descricao":"ETIQUETA TÉRMICA 10CM X 15CM 10.000 UND","categoria":"Embalagem","unidCompra":"un","preco":0.043,"rendimento":1,"unidUso":"un","fornecedorId":"forn2"},{"id":"imp11","codigo":"FITA","descricao":"FITA ADESIVA 42X300M","categoria":"Embalagem","unidCompra":"un","preco":0.043333,"rendimento":1,"unidUso":"un","fornecedorId":"forn2"},{"id":"imp12","codigo":"EMB4","descricao":"ENVELOPE 32X40CM","categoria":"Embalagem","unidCompra":"un","preco":0.25,"rendimento":1,"unidUso":"un","fornecedorId":"forn2"},{"id":"imp13","codigo":"BOLACHA","descricao":"BOLACHA PLÁSTICO ESTEIRA (SILVERIO)","categoria":"Embalagem","unidCompra":"un","preco":0.5,"rendimento":1,"unidUso":"un","fornecedorId":"forn3"},{"id":"imp14","codigo":"POTECOMED","descricao":"POTE COMEDOURO PLASTICO (SILVERIO)","categoria":"Outros","unidCompra":"un","preco":0.6,"rendimento":1,"unidUso":"un","fornecedorId":"forn3"},{"id":"imp15","codigo":"TNT","descricao":"TNT 50g 1,2m x 50m","categoria":"Embalagem","unidCompra":"un","preco":0.885,"rendimento":1,"unidUso":"un","fornecedorId":"forn4"},{"id":"imp16","codigo":"TINTAGEL","descricao":"TINTA GEL 18L (NOG, CAP, PRETO) (PREÇO POR FACE 90X60CM)","categoria":"Outros","unidCompra":"un","preco":1.65,"rendimento":1,"unidUso":"un","fornecedorId":"forn5"},{"id":"imp17","codigo":"ISOPOR","descricao":"PLACA DE ISOPOR 1M X 1M X 7,5CM","categoria":"Embalagem","unidCompra":"un","preco":0.246154,"rendimento":1,"unidUso":"un","fornecedorId":"forn6"},{"id":"imp18","codigo":"12CANETINHAS","descricao":"KIT 12 CANETINHAS HIDROCOR","categoria":"Outros","unidCompra":"un","preco":2.83,"rendimento":1,"unidUso":"un","fornecedorId":"forn7"},{"id":"imp19","codigo":"CANETINHA","descricao":"CANETINHA HIDROCOR 1 UNIDADE","categoria":"Outros","unidCompra":"un","preco":0.235833,"rendimento":1,"unidUso":"un","fornecedorId":"forn7"},{"id":"imp20","codigo":"CXPIZZA","descricao":"CAIXA PIZZA CILINDRO","categoria":"Embalagem","unidCompra":"un","preco":1.32,"rendimento":1,"unidUso":"un","fornecedorId":"forn8"},{"id":"imp21","codigo":"CAIXA1A","descricao":"CAIXA P/ NUMERO UNITARIO","categoria":"Embalagem","unidCompra":"un","preco":2.59,"rendimento":1,"unidUso":"un","fornecedorId":"forn8"},{"id":"imp22","codigo":"CXESTEIRA","descricao":"CAIXA ESTEIRA SOFÁ","categoria":"Embalagem","unidCompra":"un","preco":0.94,"rendimento":1,"unidUso":"un","fornecedorId":"forn8"},{"id":"imp23","codigo":"CAIXA2A","descricao":"CAIXA PARA KIT 10 NUMEROS","categoria":"Embalagem","unidCompra":"un","preco":3.21,"rendimento":1,"unidUso":"un","fornecedorId":"forn8"},{"id":"imp24","codigo":"CXMESAG","descricao":"CAIXA P/ MESA FAKE GRANDE","categoria":"Embalagem","unidCompra":"un","preco":7.1,"rendimento":1,"unidUso":"un","fornecedorId":"forn8"},{"id":"imp25","codigo":"CXCOFRE","descricao":"CAIXA PAPELÃO P/ COFRE","categoria":"Embalagem","unidCompra":"un","preco":0.46,"rendimento":1,"unidUso":"un","fornecedorId":"forn8"},{"id":"imp26","codigo":"CXBOMBOM","descricao":"CAIXA PAPELÃO P/ PORTA BOMBOM","categoria":"Embalagem","unidCompra":"un","preco":0.98,"rendimento":1,"unidUso":"un","fornecedorId":"forn8"},{"id":"imp27","codigo":"CXCOMEDOURO","descricao":"CAIXA PAPELÃO P/ COMEDOURO","categoria":"Embalagem","unidCompra":"un","preco":1.17,"rendimento":1,"unidUso":"un","fornecedorId":"forn8"},{"id":"imp28","codigo":"KIT12PARAFUSOS","descricao":"KIT COM 12 PARAFUSOS/BORBOLETA/RUELA","categoria":"Outros","unidCompra":"un","preco":3.9,"rendimento":1,"unidUso":"un","fornecedorId":"forn9"},{"id":"imp29","codigo":"KIT6PARAFUSOS","descricao":"KIT COM 6 PARAFUSOS/BORBOLETA/RUELA","categoria":"Outros","unidCompra":"un","preco":2.5,"rendimento":1,"unidUso":"un","fornecedorId":"forn9"},{"id":"imp30","codigo":"TUBOCOLA","descricao":"TUBO DE COLA 200ML (CHEIO)","categoria":"Outros","unidCompra":"un","preco":0.009838,"rendimento":1,"unidUso":"un","fornecedorId":"forn10"},{"id":"imp31","codigo":"COLA50KG","descricao":"BARRICA COLA 50KG","categoria":"Outros","unidCompra":"un","preco":9.838,"rendimento":1,"unidUso":"un","fornecedorId":"forn10"},{"id":"imp32","codigo":"PINO50","descricao":"PINO F50","categoria":"Outros","unidCompra":"un","preco":0.0145,"rendimento":1,"unidUso":"un","fornecedorId":"forn10"},{"id":"imp33","codigo":"FRESA6MM","descricao":"FRESA 6MM X 32MM","categoria":"Outros","unidCompra":"un","preco":88.9,"rendimento":1,"unidUso":"un","fornecedorId":"forn10"},{"id":"imp34","codigo":"PINÇA32-6MM","descricao":"PINÇA ER32 FRESA 6MM","categoria":"Outros","unidCompra":"un","preco":56.8,"rendimento":1,"unidUso":"un","fornecedorId":"forn10"},{"id":"imp35","codigo":"PINÇA25-6MM","descricao":"PINÇA ER25 FRESA 6MM","categoria":"Outros","unidCompra":"un","preco":52.9,"rendimento":1,"unidUso":"un","fornecedorId":"forn10"},{"id":"imp36","codigo":"PINÇA32-12MM","descricao":"PINÇA ER32 FRESA 12MM","categoria":"Outros","unidCompra":"un","preco":56.8,"rendimento":1,"unidUso":"un","fornecedorId":"forn10"},{"id":"imp37","codigo":"PINO10","descricao":"PINO F10","categoria":"Outros","unidCompra":"un","preco":0.002172,"rendimento":1,"unidUso":"un","fornecedorId":"forn11"},{"id":"imp38","codigo":"PINO15","descricao":"PINO F15","categoria":"Outros","unidCompra":"un","preco":0.002256,"rendimento":1,"unidUso":"un","fornecedorId":"forn11"},{"id":"imp39","codigo":"PINO25","descricao":"PINO F25","categoria":"Outros","unidCompra":"un","preco":0.00315,"rendimento":1,"unidUso":"un","fornecedorId":"forn11"},{"id":"imp40","codigo":"GRAMPO10","descricao":"GRAMPO 80/10","categoria":"Outros","unidCompra":"un","preco":0.00139,"rendimento":1,"unidUso":"un","fornecedorId":"forn11"},{"id":"imp41","codigo":"GRAMPO16","descricao":"GRAMPO 80/16","categoria":"Outros","unidCompra":"un","preco":0.00158,"rendimento":1,"unidUso":"un","fornecedorId":"forn11"},{"id":"imp42","codigo":"SACHE5G","descricao":"SACHÊ COLA 5g","categoria":"Embalagem","unidCompra":"un","preco":0.15625,"rendimento":1,"unidUso":"un","fornecedorId":"forn12"},{"id":"imp43","codigo":"CORTEROUTER","descricao":"CUSTO CORTE ROUTER (MINUTO)","categoria":"Produção","unidCompra":"min","preco":1.454326,"rendimento":1,"unidUso":"min","fornecedorId":""},{"id":"imp44","codigo":"MONTCILINDRO","descricao":"CUSTO MONTAGEM CILINDRO","categoria":"Produção","unidCompra":"un","preco":3.89415,"rendimento":1,"unidUso":"un","fornecedorId":""},{"id":"imp45","codigo":"CORTELASER","descricao":"CUSTO CORTE LASER (MINUTO)","categoria":"Produção","unidCompra":"min","preco":0.254503,"rendimento":1,"unidUso":"min","fornecedorId":""}];
const FORNECEDORES_SEED = [{"id":"forn0","nome":"MJ - Marquinhos Madeira","contato":"(19) 99629-9877","obs":""},{"id":"forn1","nome":"Gabriel Viotto - Panfletos","contato":"(19) 97135-9012","obs":""},{"id":"forn2","nome":"C.R. Spinelli - Beléu","contato":"(19) 99762-5235","obs":""},{"id":"forn3","nome":"Plasmove - Silvério","contato":"(19) 99755-1649","obs":""},{"id":"forn4","nome":"Santa Fé TNT - Luiz","contato":"(11) 94373-2553","obs":""},{"id":"forn5","nome":"Barriga Verde Tintas","contato":"(19) 99982-8583","obs":""},{"id":"forn6","nome":"Paulínia Isopor","contato":"(19) 98200-1452","obs":""},{"id":"forn7","nome":"Léo&Léo - Leonora","contato":"(48) 9100-9687","obs":""},{"id":"forn8","nome":"Máxima embalagens","contato":"(19) 99836-7445","obs":""},{"id":"forn9","nome":"Águia Fix - Fogueto","contato":"(19) 97417-4709","obs":""},{"id":"forn10","nome":"Metállica Acessórios","contato":"(19) 99999-8877","obs":""},{"id":"forn11","nome":"Air Fix - Patrícia","contato":"(51) 99237-1565","obs":""},{"id":"forn12","nome":"Mercado Livre","contato":"","obs":""}];


// Taxas importadas da SUA planilha "Custo + valor venda marketplaces" (abas Tabela de apoio)
const MKT_SEED = [
  {
    id: "shopee", nome: "Shopee", prazoDias: 15,
    nota: "Da sua tabela de apoio: 20% até R$79,99 e 14% acima; taxa fixa por faixa (R$4 / R$16 / R$20 / R$26).",
    extraNome: "", extraPct: 0,
    faixas: [
      { id: "s1", ate: 79.99, pct: 20, fixo: 4, frete: false },
      { id: "s2", ate: 99.99, pct: 14, fixo: 16, frete: false },
      { id: "s3", ate: 199.99, pct: 14, fixo: 20, frete: false },
      { id: "s4", ate: null, pct: 14, fixo: 26, frete: false },
    ],
    frete: [],
  },
  {
    id: "ml-classico", nome: "Mercado Livre — Clássico", prazoDias: 14,
    nota: "Da sua tabela de apoio: comissão 11,5%; taxa fixa de R$6,75 abaixo de R$78,90; acima de R$78,90 sem taxa fixa, mas com custo de frete grátis (adicione sua tabela de frete por peso quando tiver os valores).",
    extraNome: "", extraPct: 0,
    faixas: [
      { id: "mc1", ate: 78.89, pct: 11.5, fixo: 6.75, frete: false },
      { id: "mc2", ate: null, pct: 11.5, fixo: 0, frete: true },
    ],
    frete: [],
  },
  {
    id: "ml-premium", nome: "Mercado Livre — Premium", prazoDias: 14,
    nota: "Da sua tabela de apoio: comissão 16,5%; taxa fixa de R$6,75 abaixo de R$78,90; acima de R$78,90 sem taxa fixa, mas com custo de frete grátis (adicione sua tabela de frete por peso quando tiver os valores).",
    extraNome: "", extraPct: 0,
    faixas: [
      { id: "mp1", ate: 78.89, pct: 16.5, fixo: 6.75, frete: false },
      { id: "mp2", ate: null, pct: 16.5, fixo: 0, frete: true },
    ],
    frete: [],
  },
  {
    id: "shein", nome: "SHEIN", prazoDias: 15,
    nota: "Da sua tabela de apoio: comissão 16% + R$1,00 de provisão para taxa de pedido atrasado + frete de intermediação por peso considerado. Pacotes acima de 30 kg não são aceitos.",
    extraNome: "", extraPct: 0,
    faixas: [{ id: "sh1", ate: null, pct: 16, fixo: 1, frete: true }],
    frete: [
      { id: "sf1", ate: 0.3, valor: 4 },
      { id: "sf2", ate: 0.6, valor: 5 },
      { id: "sf3", ate: 0.9, valor: 6 },
      { id: "sf4", ate: 1.2, valor: 8 },
      { id: "sf5", ate: 1.5, valor: 10 },
      { id: "sf6", ate: 2, valor: 12 },
      { id: "sf7", ate: 5, valor: 15 },
      { id: "sf8", ate: 9, valor: 32 },
      { id: "sf9", ate: 13, valor: 63 },
      { id: "sf10", ate: 17, valor: 73 },
      { id: "sf11", ate: 23, valor: 89 },
      { id: "sf12", ate: null, valor: 106 },
    ],
  },
  {
    id: "tiktok", nome: "TikTok Shop", prazoDias: 8,
    nota: "Da sua tabela de apoio: até R$50 → 16% + R$4; acima de R$50 → 12% + R$6. ATENÇÃO: na sua planilha a taxa de afiliados (10%) aparecia como custo mas NÃO entrava no preço final — aqui ela entra. Se quiser reproduzir a planilha antiga, zere o campo abaixo.",
    extraNome: "Taxa afiliados", extraPct: 10,
    faixas: [
      { id: "t1", ate: 50, pct: 16, fixo: 4, frete: false },
      { id: "t2", ate: null, pct: 12, fixo: 6, frete: false },
    ],
    frete: [],
  },
  {
    id: "kwai", nome: "Kwai Shop", prazoDias: 15,
    nota: "Da sua tabela de apoio: 20% de comissão + R$4 por item.",
    extraNome: "", extraPct: 0,
    faixas: [{ id: "k1", ate: null, pct: 20, fixo: 4, frete: false }],
    frete: [],
  },
];

// Catálogo importado da aba "SKU + Custo produto" da sua planilha (175 produtos)
const CATALOGO = [{"sku":"2.0","desc":"Trio cilindro REDONDO LISO","custo":52.4873,"peso":9.0,"alt":82.0,"larg":55.0,"comp":56.0},{"sku":"2++7","desc":"Trio cilindro REDONDO LISO + painel redondo grande","custo":90.378,"peso":13.3,"alt":83.0,"larg":55.0,"comp":56.0},{"sku":"2++9","desc":"Trio cilindro REDONDO LISO + painel romano grande","custo":73.7504,"peso":11.5,"alt":2.0,"larg":50.0,"comp":80.0},{"sku":"2++7++9","desc":"Trio cilindro REDONDO LISO + painel redondo G + painel romano G","custo":99.6662,"peso":16.0,"alt":99.0,"larg":63.0,"comp":61.0},{"sku":"7.0","desc":"Painel redondo GRANDE","custo":40.8044,"peso":4.5,"alt":85.0,"larg":36.0,"comp":16.0},{"sku":"9.0","desc":"Painel romano GRANDE","custo":24.1767,"peso":2.8,"alt":97.0,"larg":48.0,"comp":16.0},{"sku":"25-[1-UND]","desc":"Painel de mesa 50cm","custo":4.3131,"peso":0.6,"alt":50.0,"larg":50.0,"comp":1.0},{"sku":"25-[2-UND]","desc":"Kit 2 Paineis de mesa 50cm","custo":7.6468,"peso":1.1,"alt":50.0,"larg":50.0,"comp":1.5},{"sku":"25-[3-UND]","desc":"Kit 3 Paineis de mesa 50cm","custo":10.9805,"peso":1.7,"alt":50.0,"larg":50.0,"comp":2.5},{"sku":"25-[4-UND]","desc":"Kit 4 Paineis de mesa 50cm","custo":14.3142,"peso":2.3,"alt":50.0,"larg":50.0,"comp":5.0},{"sku":"25-[5-UND]","desc":"Kit 5 Paineis de mesa 50cm","custo":17.6479,"peso":2.8,"alt":50.0,"larg":50.0,"comp":5.0},{"sku":"25-[10-UND]","desc":"Kit 10 Paineis de mesa 50cm","custo":35.4366,"peso":5.4,"alt":50.0,"larg":50.0,"comp":5.5},{"sku":"26-GRANDE","desc":"Número de CHÃO 9MM - UM (1)","custo":9.6936,"peso":1.0,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"27-GRANDE","desc":"Número de CHÃO 9MM - DOIS (2)","custo":12.6516,"peso":1.3,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"28-GRANDE","desc":"Número de CHÃO 9MM - TRÊS (3)","custo":12.5061,"peso":1.15,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"29-GRANDE","desc":"Número de CHÃO 9MM - QUATRO (4)","custo":12.1763,"peso":1.1,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"30-GRANDE","desc":"Número de CHÃO 9MM - CINCO (5)","custo":11.9436,"peso":1.2,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"31-GRANDE","desc":"Número de CHÃO 9MM - SEIS (6)","custo":12.6516,"peso":1.2,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"32-GRANDE","desc":"Número de CHÃO 9MM - SETE (7)","custo":12.1763,"peso":1.0,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"33-GRANDE","desc":"Número de CHÃO 9MM - OITO (8)","custo":12.1763,"peso":1.15,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"34-GRANDE","desc":"Número de CHÃO 9MM - NOVE (9)","custo":12.6516,"peso":1.2,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"35-GRANDE","desc":"Número de CHÃO 9MM - ZERO (0)","custo":12.6516,"peso":1.2,"alt":64.0,"larg":45.0,"comp":5.0},{"sku":"26++27++28++29++30++31++32++33++34++35-GRANDE","desc":"Kit com 10 Números de CHÃO 9MM do 0 ao 9","custo":95.2312,"peso":8.2,"alt":64.0,"larg":45.0,"comp":12.0},{"sku":"26-PEQUENO","desc":"Número de MESA 6MM - UM (1)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"27-PEQUENO","desc":"Número de MESA 6MM - DOIS (2)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"28-PEQUENO","desc":"Número de MESA 6MM - TRÊS (3)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"29-PEQUENO","desc":"Número de MESA 6MM - QUATRO (4)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"30-PEQUENO","desc":"Número de MESA 6MM - CINCO (5)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"31-PEQUENO","desc":"Número de MESA 6MM - SEIS (6)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"32-PEQUENO","desc":"Número de MESA 6MM - SETE (7)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"33-PEQUENO","desc":"Número de MESA 6MM - OITO (8)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"34-PEQUENO","desc":"Número de MESA 6MM - NOVE (9)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"35-PEQUENO","desc":"Número de MESA 6MM - ZERO (0)","custo":4.0998,"peso":0.3,"alt":31.5,"larg":21.0,"comp":6.0},{"sku":"26++27++28++29++30++31++32++33++34++35-PEQUENO","desc":"Kit com 10 Números de MESA 6MM do 0 ao 9","custo":32.1443,"peso":2.1,"alt":65.0,"larg":45.0,"comp":7.5},{"sku":"5-NOG","desc":"Esteira sofá simples NOGUEIRA","custo":5.6535,"peso":0.4,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"5-NOG-[2UND]","desc":"Kit 2 Esteiras sofá simples NOGUEIRA","custo":10.0271,"peso":0.7,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"5-CAP","desc":"Esteira sofá simples CAPUCCINO","custo":5.6535,"peso":0.4,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"5-CAP-[2UND]","desc":"Kit 2 Esteiras sofá simples CAPUCCINO","custo":10.0271,"peso":0.7,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"5-PRETO","desc":"Esteira sofá simples PRETO","custo":5.6535,"peso":0.4,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"5-PRETO-[2UND]","desc":"Kit 2 Esteiras sofá simples PRETO","custo":10.0271,"peso":0.7,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"6-NOG","desc":"Esteira sofá controle NOGUEIRA","custo":7.064,"peso":0.5,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"6-NOG-[2UND]","desc":"Kit 2 Esteiras sofá controle NOGUEIRA","custo":12.7942,"peso":0.9,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"6-CAP","desc":"Esteira sofá controle CAPUCCINO","custo":7.064,"peso":0.5,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"6-CAP-[2UND]","desc":"Kit 2 Esteiras sofá controle CAPUCCINO","custo":12.7942,"peso":0.9,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"6-PRETO","desc":"Esteira sofá controle PRETO","custo":7.064,"peso":0.5,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"6-PRETO-[2UND]","desc":"Kit 2 Esteiras sofá controle PRETO","custo":12.7942,"peso":0.9,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"5++6--NOG","desc":"Kit 2 Esteiras sofá controle + simples NOGUEIRA","custo":11.4382,"peso":0.8,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"5++6--CAP","desc":"Kit 2 Esteiras sofá controle + simples CAPUCCINO","custo":11.4382,"peso":0.8,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"5++6--PRETO","desc":"Kit 2 Esteiras sofá controle + simples PRETO","custo":11.4382,"peso":0.8,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"24--1K-CRU","desc":"Cofre Desafio CRU R$1.000,00","custo":3.2779,"peso":0.3,"alt":21.5,"larg":17.0,"comp":5.0},{"sku":"24--1K-CRU-[2UND]","desc":"Kit 2 Cofres Desafio CRU R$1.000,00","custo":5.6759,"peso":0.6,"alt":21.5,"larg":17.0,"comp":10.0},{"sku":"24--1K-NOG","desc":"Cofre Desafio NOGUEIRA R$1.000,00","custo":4.1029,"peso":0.3,"alt":21.5,"larg":17.0,"comp":5.0},{"sku":"24--1K-NOG-[2UND]","desc":"Kit 2 Cofres Desafio NOGUEIRA R$1.000,00","custo":7.3259,"peso":0.6,"alt":21.5,"larg":17.0,"comp":10.0},{"sku":"24--5K-CRU","desc":"Cofre Desafio CRU R$5.000,00","custo":3.2779,"peso":0.3,"alt":21.5,"larg":17.0,"comp":5.0},{"sku":"24--5K-CRU-[2UND]","desc":"Kit 2 Cofres Desafio CRU R$5.000,00","custo":5.6759,"peso":0.6,"alt":21.5,"larg":17.0,"comp":10.0},{"sku":"24--5K-NOG","desc":"Cofre Desafio NOGUEIRA R$5.000,00","custo":4.1029,"peso":0.3,"alt":21.5,"larg":17.0,"comp":5.0},{"sku":"24--5K-NOG-[2UND]","desc":"Kit 2 Cofres Desafio NOGUEIRA R$5.000,00","custo":7.3259,"peso":0.6,"alt":21.5,"larg":17.0,"comp":10.0},{"sku":"24--10K-CRU","desc":"Cofre Desafio CRU R$10.000,00","custo":3.2779,"peso":0.3,"alt":21.5,"larg":17.0,"comp":5.0},{"sku":"24--10K-CRU-[2UND]","desc":"Kit 2 Cofres Desafio CRU R$10.000,00","custo":5.6759,"peso":0.6,"alt":21.5,"larg":17.0,"comp":10.0},{"sku":"24--10K-NOG","desc":"Cofre Desafio NOGUEIRA R$10.000,00","custo":4.1029,"peso":0.3,"alt":21.5,"larg":17.0,"comp":5.0},{"sku":"24--10K-NOG-[2UND]","desc":"Kit 2 Cofres Desafio NOGUEIRA R$10.000,00","custo":7.3259,"peso":0.6,"alt":21.5,"larg":17.0,"comp":10.0},{"sku":"37-CRU","desc":"Comedouro 2 potes - CRU","custo":4.6537,"peso":0.4,"alt":32.0,"larg":16.5,"comp":9.0},{"sku":"38-CRU","desc":"Comedouro 1 pote - CRU","custo":3.5814,"peso":0.3,"alt":20.0,"larg":16.5,"comp":6.0},{"sku":"37-NOG","desc":"Comedouro 2 potes - NOGUEIRA","custo":5.1417,"peso":0.4,"alt":32.0,"larg":16.5,"comp":9.0},{"sku":"38-NOG","desc":"Comedouro 1 pote - NOGUEIRA","custo":3.9527,"peso":0.3,"alt":20.0,"larg":16.5,"comp":6.0},{"sku":"37-PRETO","desc":"Comedouro 2 potes - PRETO","custo":5.1417,"peso":0.4,"alt":32.0,"larg":16.5,"comp":9.0},{"sku":"38-PRETO","desc":"Comedouro 1 pote - PRETO","custo":3.9527,"peso":0.3,"alt":20.0,"larg":16.5,"comp":6.0},{"sku":"37-CAP","desc":"Comedouro 2 potes - CAPUCCINO","custo":5.1417,"peso":0.4,"alt":32.0,"larg":16.5,"comp":9.0},{"sku":"38-CAP","desc":"Comedouro 1 pote - CAPUCCINO","custo":3.9527,"peso":0.3,"alt":20.0,"larg":16.5,"comp":6.0},{"sku":"41-[5-UND]","desc":"Kit 5 Jogos da velha","custo":2.1233,"peso":0.3,"alt":20.5,"larg":17.0,"comp":5.5},{"sku":"41-[10-UND]","desc":"Kit 10 Jogos da velha","custo":3.9807,"peso":0.4,"alt":20.5,"larg":17.0,"comp":6.0},{"sku":"41-[20-UND]","desc":"Kit 20 Jogos da velha","custo":7.8453,"peso":0.8,"alt":31.0,"larg":21.0,"comp":6.5},{"sku":"41-[30-UND]","desc":"Kit 30 Jogos da velha","custo":11.56,"peso":1.1,"alt":32.0,"larg":21.0,"comp":7.0},{"sku":"42-[10-UND]","desc":"Kit 10 bolas de natal","custo":1.0697,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"42-[20-UND]","desc":"Kit 20 bolas de natal","custo":1.8734,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"42-[30-UND]","desc":"Kit 30 bolas de natal","custo":2.6771,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"42-[40-UND]","desc":"Kit 40 bolas de natal","custo":3.6308,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"42-[50-UND]","desc":"Kit 50 bolas de natal","custo":4.4345,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"42-[100-UND]","desc":"Kit 100 bolas de natal","custo":8.453,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"46-[1UND]","desc":"Kit 12 canetinhas hidrocor","custo":3.096,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"46-[2UND]","desc":"Kit 24 canetinhas hidrocor","custo":5.926,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"81.0","desc":"Porta bombom coelho","custo":0.3532,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"81-[10-UND]","desc":"Kit 10 Portas bombom coelho","custo":2.2884,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"81-[20-UND]","desc":"Kit 20 Portas bombom coelho","custo":4.1607,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"81-[30-UND]","desc":"Kit 30 Portas bombom coelho","custo":6.0331,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"81-[40-UND]","desc":"Kit 40 Portas bombom coelho","custo":7.9054,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"81-[50-UND]","desc":"Kit 50 Portas bombom coelho","custo":9.7778,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"81-[100-UND]","desc":"Kit 100 Portas bombom coelho","custo":19.1396,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"82-[1-UND]","desc":"Bandeja Feliz Páscoa 20x15x5,5cm","custo":3.0198,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"82-[5-UND]","desc":"Kit 5 Bandejas Feliz Páscoa 20x15x5,5cm","custo":10.515,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"82-[10-UND]","desc":"Kit 10 Bandejas Feliz Páscoa 20x15x5,5cm","custo":19.884,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"83-CRU","desc":"Suporte folha A4 - 4 bandejas - CRU","custo":9.6286,"peso":1.2,"alt":33.0,"larg":25.0,"comp":4.0},{"sku":"84-CRU","desc":"Suporte folha A4 - 6 bandejas - CRU","custo":14.5413,"peso":1.7,"alt":36.0,"larg":34.0,"comp":6.0},{"sku":"83-BRANCO","desc":"Suporte folha A4 - 4 bandejas - BRANCO","custo":14.4411,"peso":1.2,"alt":33.0,"larg":25.0,"comp":4.0},{"sku":"84-BRANCO","desc":"Suporte folha A4 - 6 bandejas - BRANCO","custo":22.1038,"peso":1.7,"alt":36.0,"larg":34.0,"comp":6.0},{"sku":"85--1K-BRANCO","desc":"Cofre quadrado laminado BRANCO - R$1.000,00","custo":6.3217,"peso":0.4,"alt":21.5,"larg":16.5,"comp":5.5},{"sku":"85--5K-BRANCO","desc":"Cofre quadrado laminado BRANCO - R$5.000,00","custo":6.3217,"peso":0.4,"alt":21.5,"larg":16.5,"comp":5.5},{"sku":"85--10K-BRANCO","desc":"Cofre quadrado laminado BRANCO - R$10.000,00","custo":6.3217,"peso":0.4,"alt":21.5,"larg":16.5,"comp":5.5},{"sku":"85--20K-BRANCO","desc":"Cofre quadrado laminado BRANCO - R$20.000,00","custo":6.3217,"peso":0.4,"alt":21.5,"larg":16.5,"comp":5.5},{"sku":"86-CRU-[10-UND]","desc":"Kit 10 Porta-bombons coração dia das mães - CRU","custo":3.2229,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-CRU-[20-UND]","desc":"Kit 20 Porta-bombons coração dia das mães - CRU","custo":5.1264,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-CRU-[30-UND]","desc":"Kit 30 Porta-bombons coração dia das mães - CRU","custo":7.0299,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-CRU-[40-UND]","desc":"Kit 40 Porta-bombons coração dia das mães - CRU","custo":8.9335,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-CRU-[50-UND]","desc":"Kit 50 Porta-bombons coração dia das mães - CRU","custo":10.837,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-CRU-[100-UND]","desc":"Kit 100 Porta-bombons coração dia das mães - CRU","custo":20.3547,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-BRANCO-[10-UND]","desc":"Kit 10 Porta-bombons coração dia das mães - BRANCO","custo":3.8122,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-BRANCO-[20-UND]","desc":"Kit 20 Porta-bombons coração dia das mães - BRANCO","custo":6.305,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-BRANCO-[30-UND]","desc":"Kit 30 Porta-bombons coração dia das mães - BRANCO","custo":8.7978,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-BRANCO-[40-UND]","desc":"Kit 40 Porta-bombons coração dia das mães - BRANCO","custo":11.2906,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-BRANCO-[50-UND]","desc":"Kit 50 Porta-bombons coração dia das mães - BRANCO","custo":13.7835,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"86-BRANCO-[100-UND]","desc":"Kit 100 Porta-bombons coração dia das mães - BRANCO","custo":26.2476,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"87-CRU-[10-UND]","desc":"Kit 10 Porta-bombons FLOR - CRU","custo":2.8411,"peso":0.3,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-CRU-[20-UND]","desc":"Kit 20 Porta-bombons FLOR - CRU","custo":4.3629,"peso":0.4,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-CRU-[30-UND]","desc":"Kit 30 Porta-bombons FLOR - CRU","custo":5.8846,"peso":0.6,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-CRU-[40-UND]","desc":"Kit 40 Porta-bombons FLOR - CRU","custo":7.4064,"peso":0.7,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-CRU-[50-UND]","desc":"Kit 50 Porta-bombons FLOR - CRU","custo":8.9281,"peso":0.9,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-CRU-[100-UND]","desc":"Kit 100 Porta-bombons FLOR - CRU","custo":16.537,"peso":1.6,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-BRANCO-[10-UND]","desc":"Kit 10 Porta-bombons FLOR - BRANCO","custo":3.4304,"peso":0.3,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-BRANCO-[20-UND]","desc":"Kit 20 Porta-bombons FLOR - BRANCO","custo":5.5414,"peso":0.4,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-BRANCO-[30-UND]","desc":"Kit 30 Porta-bombons FLOR - BRANCO","custo":7.6525,"peso":0.6,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-BRANCO-[40-UND]","desc":"Kit 40 Porta-bombons FLOR - BRANCO","custo":9.7635,"peso":0.7,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-BRANCO-[50-UND]","desc":"Kit 50 Porta-bombons FLOR - BRANCO","custo":11.8746,"peso":0.9,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"87-BRANCO-[100-UND]","desc":"Kit 100 Porta-bombons FLOR - BRANCO","custo":22.4298,"peso":1.6,"alt":41.5,"larg":21.5,"comp":5.0},{"sku":"90-CRU-[10-UND]","desc":"Kit 10 Porta-bombons TROFÉU PAI 1 - CRU","custo":4.3642,"peso":0.4,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-CRU-[20-UND]","desc":"Kit 20 Porta-bombons TROFÉU PAI 1 - CRU","custo":7.4091,"peso":0.6,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-CRU-[30-UND]","desc":"Kit 30 Porta-bombons TROFÉU PAI 1 - CRU","custo":10.454,"peso":0.8,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-CRU-[40-UND]","desc":"Kit 40 Porta-bombons TROFÉU PAI 1 - CRU","custo":13.4989,"peso":1.0,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-CRU-[50-UND]","desc":"Kit 50 Porta-bombons TROFÉU PAI 1 - CRU","custo":16.5438,"peso":1.3,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-CRU-[100-UND]","desc":"Kit 100 Porta-bombons TROFÉU PAI 1 - CRU","custo":31.7683,"peso":2.6,"alt":42.0,"larg":22.5,"comp":10.5},{"sku":"90-BRANCO-[10-UND]","desc":"Kit 10 Porta-bombons TROFÉU PAI 1 - BRANCO","custo":5.3955,"peso":0.4,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-BRANCO-[20-UND]","desc":"Kit 20 Porta-bombons TROFÉU PAI 1 - BRANCO","custo":9.4717,"peso":0.6,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-BRANCO-[30-UND]","desc":"Kit 30 Porta-bombons TROFÉU PAI 1 - BRANCO","custo":13.5479,"peso":0.8,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-BRANCO-[40-UND]","desc":"Kit 40 Porta-bombons TROFÉU PAI 1 - BRANCO","custo":17.6242,"peso":1.0,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-BRANCO-[50-UND]","desc":"Kit 50 Porta-bombons TROFÉU PAI 1 - BRANCO","custo":21.7004,"peso":1.3,"alt":41.5,"larg":21.0,"comp":5.5},{"sku":"90-BRANCO-[100-UND]","desc":"Kit 100 Porta-bombons TROFÉU PAI 1 - BRANCO","custo":42.0814,"peso":2.6,"alt":42.0,"larg":22.5,"comp":10.5},{"sku":"91-CRU-[10-UND]","desc":"Kit 10 Porta-bombons TROFÉU PAI 2 - CRU","custo":7.5201,"peso":0.6,"alt":23.0,"larg":17.0,"comp":4.0},{"sku":"91-CRU-[20-UND]","desc":"Kit 20 Porta-bombons TROFÉU PAI 2 - CRU","custo":13.7208,"peso":1.2,"alt":25.0,"larg":17.0,"comp":6.0},{"sku":"91-CRU-[30-UND]","desc":"Kit 30 Porta-bombons TROFÉU PAI 2 - CRU","custo":19.9216,"peso":1.8,"alt":24.0,"larg":17.0,"comp":9.0},{"sku":"91-CRU-[40-UND]","desc":"Kit 40 Porta-bombons TROFÉU PAI 2 - CRU","custo":26.1223,"peso":2.35,"alt":31.0,"larg":25.0,"comp":7.5},{"sku":"91-CRU-[50-UND]","desc":"Kit 50 Porta-bombons TROFÉU PAI 2 - CRU","custo":32.3231,"peso":2.95,"alt":31.0,"larg":24.0,"comp":8.5},{"sku":"91-CRU-[100-UND]","desc":"Kit 100 Porta-bombons TROFÉU PAI 2 - CRU","custo":63.3268,"peso":6.0,"alt":32.0,"larg":24.0,"comp":17.0},{"sku":"91-BRANCO-[10-UND]","desc":"Kit 10 Porta-bombons TROFÉU PAI 2 - BRANCO","custo":9.8118,"peso":0.6,"alt":24.0,"larg":17.0,"comp":4.0},{"sku":"91-BRANCO-[20-UND]","desc":"Kit 20 Porta-bombons TROFÉU PAI 2 - BRANCO","custo":18.3042,"peso":1.2,"alt":24.0,"larg":17.0,"comp":6.0},{"sku":"91-BRANCO-[30-UND]","desc":"Kit 30 Porta-bombons TROFÉU PAI 2 - BRANCO","custo":26.7966,"peso":1.8,"alt":24.0,"larg":17.0,"comp":9.0},{"sku":"91-BRANCO-[40-UND]","desc":"Kit 40 Porta-bombons TROFÉU PAI 2 - BRANCO","custo":35.289,"peso":2.35,"alt":31.0,"larg":25.0,"comp":7.5},{"sku":"91-BRANCO-[50-UND]","desc":"Kit 50 Porta-bombons TROFÉU PAI 2 - BRANCO","custo":43.7814,"peso":2.95,"alt":31.0,"larg":25.0,"comp":8.5},{"sku":"91-BRANCO-[100-UND]","desc":"Kit 100 Porta-bombons TROFÉU PAI 2 - BRANCO","custo":86.2435,"peso":6.0,"alt":32.0,"larg":25.0,"comp":17.0},{"sku":"92-CRU-[10-UND]","desc":"Kit 10 Porta-bombons CAMISA PAI - CRU","custo":3.717,"peso":0.2,"alt":21.0,"larg":16.5,"comp":5.5},{"sku":"92-CRU-[20-UND]","desc":"Kit 20 Porta-bombons CAMISA PAI - CRU","custo":6.1147,"peso":0.3,"alt":21.0,"larg":16.5,"comp":5.5},{"sku":"92-CRU-[30-UND]","desc":"Kit 30 Porta-bombons CAMISA PAI - CRU","custo":8.5124,"peso":0.4,"alt":21.0,"larg":16.5,"comp":5.5},{"sku":"92-CRU-[40-UND]","desc":"Kit 40 Porta-bombons CAMISA PAI - CRU","custo":10.9101,"peso":0.53,"alt":30.5,"larg":21.0,"comp":6.5},{"sku":"92-CRU-[50-UND]","desc":"Kit 50 Porta-bombons CAMISA PAI - CRU","custo":13.3078,"peso":0.65,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"92-CRU-[100-UND]","desc":"Kit 100 Porta-bombons CAMISA PAI - CRU","custo":25.2963,"peso":1.3,"alt":31.5,"larg":21.5,"comp":12.5},{"sku":"92-BRANCO-[10-UND]","desc":"Kit 10 Porta-bombons CAMISA PAI - BRANCO","custo":4.542,"peso":0.2,"alt":21.0,"larg":16.5,"comp":5.5},{"sku":"92-BRANCO-[20-UND]","desc":"Kit 20 Porta-bombons CAMISA PAI - BRANCO","custo":7.7647,"peso":0.3,"alt":21.0,"larg":16.5,"comp":5.5},{"sku":"92-BRANCO-[30-UND]","desc":"Kit 30 Porta-bombons CAMISA PAI - BRANCO","custo":10.9874,"peso":0.4,"alt":21.0,"larg":16.5,"comp":5.5},{"sku":"92-BRANCO-[40-UND]","desc":"Kit 40 Porta-bombons CAMISA PAI - BRANCO","custo":14.2101,"peso":0.53,"alt":30.5,"larg":21.0,"comp":6.5},{"sku":"92-BRANCO-[50-UND]","desc":"Kit 50 Porta-bombons CAMISA PAI - BRANCO","custo":17.4328,"peso":0.65,"alt":31.5,"larg":21.0,"comp":6.5},{"sku":"92-BRANCO-[100-UND]","desc":"Kit 100 Porta-bombons CAMISA PAI - BRANCO","custo":33.5463,"peso":1.3,"alt":31.5,"larg":21.5,"comp":12.5},{"sku":"93-CRU","desc":"Bandeja Feliz dia dos pais 19x14,5x5cm - CRU","custo":2.8366,"peso":0.25,"alt":21.5,"larg":17.0,"comp":5.5},{"sku":"93-CRU-[5-UND]","desc":"Kit 5 Bandejas Feliz dia dos pais 19x14,5x5cm - CRU","custo":9.5988,"peso":0.8,"alt":21.5,"larg":17.0,"comp":5.5},{"sku":"93-CRU-[10-UND]","desc":"Kit 10 Bandejas Feliz dia dos pais 19x14,5x5cm - CRU","custo":18.0515,"peso":1.5,"alt":31.0,"larg":16.5,"comp":9.5},{"sku":"93-BRANCO","desc":"Bandeja Feliz dia dos pais 19x14,5x5cm - BRANCO","custo":3.5241,"peso":0.25,"alt":21.5,"larg":17.0,"comp":5.5},{"sku":"93-BRANCO-[5-UND]","desc":"Kit 5 Bandejas Feliz dia dos pais 19x14,5x5cm - BRANCO","custo":13.0363,"peso":0.8,"alt":21.5,"larg":17.0,"comp":5.5},{"sku":"93-BRANCO-[10-UND]","desc":"Kit 10 Bandejas Feliz dia dos pais 19x14,5x5cm - BRANCO","custo":24.9265,"peso":1.5,"alt":31.0,"larg":16.5,"comp":9.5},{"sku":"94-CRU","desc":"Bandeja SUPER PAI 19x14,5x5cm - CRU","custo":2.8366,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"94-CRU-[5-UND]","desc":"Kit 5 Bandejas SUPER PAI 19x14,5x5cm - CRU","custo":9.5988,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"94-CRU-[10-UND]","desc":"Kit 10 Bandejas SUPER PAI 19x14,5x5cm - CRU","custo":18.0515,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"94-BRANCO","desc":"Bandeja SUPER PAI 19x14,5x5cm - BRANCO","custo":3.5241,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"94-BRANCO-[5-UND]","desc":"Kit 5 Bandejas SUPER PAI 19x14,5x5cm - BRANCO","custo":13.0363,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"94-BRANCO-[10-UND]","desc":"Kit 10 Bandejas SUPER PAI 19x14,5x5cm - BRANCO","custo":24.9265,"peso":0.6,"alt":8.0,"larg":20.0,"comp":30.0},{"sku":"95.0","desc":"Abecedário colorido pedagógico","custo":5.7017,"peso":0.5,"alt":31.0,"larg":21.0,"comp":6.0},{"sku":"96.0","desc":"Formas geométricas colorido pedagógico","custo":4.1581,"peso":0.35,"alt":23.0,"larg":23.0,"comp":3.5},{"sku":"97.0","desc":"Mapa do Brasil colorido pedagógico","custo":5.1243,"peso":0.3,"alt":21.0,"larg":21.0,"comp":3.0},{"sku":"99.0","desc":"Tangram colorido pedagógico","custo":4.7923,"peso":0.3,"alt":31.0,"larg":21.0,"comp":6.0}];

const FICHAS_SEED = {"2.0":[{"insumoId":"imp0","qtd":3.0094},{"insumoId":"imp2","qtd":0.918578},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp6","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp20","qtd":2.0},{"insumoId":"imp30","qtd":20.0},{"insumoId":"imp40","qtd":160.0},{"insumoId":"imp41","qtd":120.0},{"insumoId":"imp43","qtd":1.0},{"insumoId":"imp44","qtd":1.0}],"2++7":[{"insumoId":"imp0","qtd":3.0094},{"insumoId":"imp2","qtd":0.918578},{"insumoId":"imp3","qtd":1.13056},{"insumoId":"imp28","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp6","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp20","qtd":2.0},{"insumoId":"imp30","qtd":20.0},{"insumoId":"imp40","qtd":160.0},{"insumoId":"imp41","qtd":120.0},{"insumoId":"imp43","qtd":5.9},{"insumoId":"imp44","qtd":1.0}],"2++9":[{"insumoId":"imp0","qtd":3.0094},{"insumoId":"imp2","qtd":1.765777},{"insumoId":"imp29","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp6","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp20","qtd":2.0},{"insumoId":"imp30","qtd":20.0},{"insumoId":"imp40","qtd":160.0},{"insumoId":"imp41","qtd":120.0},{"insumoId":"imp43","qtd":3.334},{"insumoId":"imp44","qtd":1.0}],"2++7++9":[{"insumoId":"imp0","qtd":3.0094},{"insumoId":"imp2","qtd":1.765777},{"insumoId":"imp3","qtd":1.13056},{"insumoId":"imp29","qtd":1.0},{"insumoId":"imp28","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp6","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp20","qtd":2.0},{"insumoId":"imp30","qtd":20.0},{"insumoId":"imp40","qtd":160.0},{"insumoId":"imp41","qtd":120.0},{"insumoId":"imp43","qtd":0.0},{"insumoId":"imp44","qtd":1.0}],"7.0":[{"insumoId":"imp3","qtd":1.13056},{"insumoId":"imp28","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp9","qtd":2.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp43","qtd":5.9}],"9.0":[{"insumoId":"imp2","qtd":0.8472},{"insumoId":"imp29","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp9","qtd":2.0},{"insumoId":"imp43","qtd":3.334}],"5-NOG":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp15","qtd":0.25},{"insumoId":"imp30","qtd":50.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp13","qtd":2.0},{"insumoId":"imp16","qtd":0.25},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":4.12},{"insumoId":"imp11","qtd":4.0}],"5-CAP":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp15","qtd":0.25},{"insumoId":"imp30","qtd":50.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp13","qtd":2.0},{"insumoId":"imp16","qtd":0.25},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":4.12},{"insumoId":"imp11","qtd":4.0}],"5-PRETO":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp15","qtd":0.25},{"insumoId":"imp30","qtd":50.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp13","qtd":2.0},{"insumoId":"imp16","qtd":0.25},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":4.12},{"insumoId":"imp11","qtd":4.0}],"5-NOG-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.5},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":8.24},{"insumoId":"imp11","qtd":4.0}],"5-CAP-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.5},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":8.24},{"insumoId":"imp11","qtd":4.0}],"5-PRETO-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.5},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":8.24},{"insumoId":"imp11","qtd":4.0}],"6-NOG":[{"insumoId":"imp0","qtd":0.197525},{"insumoId":"imp15","qtd":0.25},{"insumoId":"imp30","qtd":50.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":2.0},{"insumoId":"imp16","qtd":0.35},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":6.2},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"6-CAP":[{"insumoId":"imp0","qtd":0.197525},{"insumoId":"imp15","qtd":0.25},{"insumoId":"imp30","qtd":50.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":2.0},{"insumoId":"imp16","qtd":0.35},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":6.2},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"6-PRETO":[{"insumoId":"imp0","qtd":0.197525},{"insumoId":"imp15","qtd":0.25},{"insumoId":"imp30","qtd":50.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":2.0},{"insumoId":"imp16","qtd":0.35},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":6.2},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"6-NOG-[2UND]":[{"insumoId":"imp0","qtd":0.39505},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.7},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":12.5},{"insumoId":"imp42","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"6-CAP-[2UND]":[{"insumoId":"imp0","qtd":0.39505},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.7},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":12.5},{"insumoId":"imp42","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"6-PRETO-[2UND]":[{"insumoId":"imp0","qtd":0.39505},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.7},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":12.5},{"insumoId":"imp42","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"5++6--NOG":[{"insumoId":"imp0","qtd":0.338625},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.6},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":10.32},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"5++6--CAP":[{"insumoId":"imp0","qtd":0.338625},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.6},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":10.32},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"5++6--PRETO":[{"insumoId":"imp0","qtd":0.338625},{"insumoId":"imp15","qtd":0.5},{"insumoId":"imp30","qtd":100.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp13","qtd":4.0},{"insumoId":"imp16","qtd":0.6},{"insumoId":"imp22","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":10.32},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"24--1K-CRU":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":3.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":3.0},{"insumoId":"imp42","qtd":1.0}],"24--5K-CRU":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":3.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":3.0},{"insumoId":"imp42","qtd":1.0}],"24--10K-CRU":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":3.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":3.0},{"insumoId":"imp42","qtd":1.0}],"24--1K-CRU-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":4.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":2.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":6.0},{"insumoId":"imp42","qtd":2.0}],"24--5K-CRU-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":4.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":2.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":6.0},{"insumoId":"imp42","qtd":2.0}],"24--10K-CRU-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":4.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":2.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":6.0},{"insumoId":"imp42","qtd":2.0}],"24--1K-NOG":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp16","qtd":0.5},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":3.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":3.0},{"insumoId":"imp42","qtd":1.0}],"24--5K-NOG":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp16","qtd":0.5},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":3.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":3.0},{"insumoId":"imp42","qtd":1.0}],"24--10K-NOG":[{"insumoId":"imp0","qtd":0.1411},{"insumoId":"imp16","qtd":0.5},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":3.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":3.0},{"insumoId":"imp42","qtd":1.0}],"24--1K-NOG-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp16","qtd":1.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":4.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":2.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":6.0},{"insumoId":"imp42","qtd":2.0}],"24--5K-NOG-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp16","qtd":1.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":4.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":2.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":6.0},{"insumoId":"imp42","qtd":2.0}],"24--10K-NOG-[2UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp16","qtd":1.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp10","qtd":4.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp19","qtd":2.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":6.0},{"insumoId":"imp42","qtd":2.0}],"25-[1-UND]":[{"insumoId":"imp0","qtd":0.33},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp8","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":1.5},{"insumoId":"imp43","qtd":0.1}],"25-[2-UND]":[{"insumoId":"imp0","qtd":0.66},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp8","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":3.0},{"insumoId":"imp43","qtd":0.2}],"25-[3-UND]":[{"insumoId":"imp0","qtd":0.99},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp8","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":4.5},{"insumoId":"imp43","qtd":0.3}],"25-[4-UND]":[{"insumoId":"imp0","qtd":1.32},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp8","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":6.0},{"insumoId":"imp43","qtd":0.4}],"25-[5-UND]":[{"insumoId":"imp0","qtd":1.65},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp8","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp45","qtd":7.5},{"insumoId":"imp43","qtd":0.5}],"25-[10-UND]":[{"insumoId":"imp0","qtd":3.3},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp8","qtd":1.0},{"insumoId":"imp11","qtd":4.0},{"insumoId":"imp9","qtd":2.0},{"insumoId":"imp45","qtd":15.0},{"insumoId":"imp43","qtd":1.0}],"26-GRANDE":[{"insumoId":"imp3","qtd":0.24},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp21","qtd":1.0}],"27-GRANDE":[{"insumoId":"imp3","qtd":0.34},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":1.1},{"insumoId":"imp21","qtd":1.0}],"28-GRANDE":[{"insumoId":"imp3","qtd":0.34},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":1.0},{"insumoId":"imp21","qtd":1.0}],"29-GRANDE":[{"insumoId":"imp3","qtd":0.32},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":1.1},{"insumoId":"imp21","qtd":1.0}],"30-GRANDE":[{"insumoId":"imp3","qtd":0.32},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":0.94},{"insumoId":"imp21","qtd":1.0}],"31-GRANDE":[{"insumoId":"imp3","qtd":0.34},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":1.1},{"insumoId":"imp21","qtd":1.0}],"32-GRANDE":[{"insumoId":"imp3","qtd":0.32},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":1.1},{"insumoId":"imp21","qtd":1.0}],"33-GRANDE":[{"insumoId":"imp3","qtd":0.32},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":1.1},{"insumoId":"imp21","qtd":1.0}],"34-GRANDE":[{"insumoId":"imp3","qtd":0.34},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":1.1},{"insumoId":"imp21","qtd":1.0}],"35-GRANDE":[{"insumoId":"imp3","qtd":0.34},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":5.0},{"insumoId":"imp43","qtd":1.1},{"insumoId":"imp21","qtd":1.0}],"26++27++28++29++30++31++32++33++34++35-GRANDE":[{"insumoId":"imp3","qtd":3.22},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":7.0},{"insumoId":"imp43","qtd":10.34},{"insumoId":"imp23","qtd":1.0}],"26-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"27-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"28-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"29-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"30-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"31-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"32-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"33-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"34-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"35-PEQUENO":[{"insumoId":"imp2","qtd":0.10175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":0.7},{"insumoId":"imp22","qtd":1.0}],"26++27++28++29++30++31++32++33++34++35-PEQUENO":[{"insumoId":"imp2","qtd":1.0175},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":3.0},{"insumoId":"imp43","qtd":7.0},{"insumoId":"imp23","qtd":1.0}],"37-NOG":[{"insumoId":"imp1","qtd":0.08348},{"insumoId":"imp16","qtd":0.2957},{"insumoId":"imp14","qtd":2.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp27","qtd":1.0},{"insumoId":"imp45","qtd":3.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"37-CAP":[{"insumoId":"imp1","qtd":0.08348},{"insumoId":"imp16","qtd":0.2957},{"insumoId":"imp14","qtd":2.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp27","qtd":1.0},{"insumoId":"imp45","qtd":3.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"37-PRETO":[{"insumoId":"imp1","qtd":0.08348},{"insumoId":"imp16","qtd":0.2957},{"insumoId":"imp14","qtd":2.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp27","qtd":1.0},{"insumoId":"imp45","qtd":3.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"37-CRU":[{"insumoId":"imp1","qtd":0.08348},{"insumoId":"imp14","qtd":2.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp27","qtd":1.0},{"insumoId":"imp45","qtd":3.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"38-NOG":[{"insumoId":"imp1","qtd":0.0596},{"insumoId":"imp16","qtd":0.225},{"insumoId":"imp14","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp27","qtd":1.0},{"insumoId":"imp45","qtd":2.65},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"38-CAP":[{"insumoId":"imp1","qtd":0.0596},{"insumoId":"imp16","qtd":0.225},{"insumoId":"imp14","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp27","qtd":1.0},{"insumoId":"imp45","qtd":2.65},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"38-PRETO":[{"insumoId":"imp1","qtd":0.0596},{"insumoId":"imp16","qtd":0.225},{"insumoId":"imp14","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp27","qtd":1.0},{"insumoId":"imp45","qtd":2.65},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"38-CRU":[{"insumoId":"imp1","qtd":0.0596},{"insumoId":"imp14","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp27","qtd":1.0},{"insumoId":"imp45","qtd":2.65},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"41-[5-UND]":[{"insumoId":"imp0","qtd":0.0926},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp7","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":4.2035}],"41-[10-UND]":[{"insumoId":"imp0","qtd":0.1852},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp7","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":8.407}],"41-[20-UND]":[{"insumoId":"imp0","qtd":0.3704},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":16.814}],"41-[30-UND]":[{"insumoId":"imp0","qtd":0.5556},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":25.221}],"42-[10-UND]":[{"insumoId":"imp0","qtd":0.0471},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp7","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":1.584}],"42-[20-UND]":[{"insumoId":"imp0","qtd":0.0942},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp7","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":3.168}],"42-[30-UND]":[{"insumoId":"imp0","qtd":0.1413},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp7","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":4.752}],"42-[40-UND]":[{"insumoId":"imp0","qtd":0.1884},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":6.336}],"42-[50-UND]":[{"insumoId":"imp0","qtd":0.2355},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":7.92}],"42-[100-UND]":[{"insumoId":"imp0","qtd":0.471},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp45","qtd":15.84}],"46-[1UND]":[{"insumoId":"imp18","qtd":1.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp7","qtd":1.0},{"insumoId":"imp10","qtd":2.0}],"46-[2UND]":[{"insumoId":"imp18","qtd":2.0},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp7","qtd":1.0},{"insumoId":"imp10","qtd":2.0}],"81.0":[{"insumoId":"imp0","qtd":0.007053},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp45","qtd":0.5},{"insumoId":"imp10","qtd":2.0}],"81-[10-UND]":[{"insumoId":"imp0","qtd":0.070531},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp45","qtd":5.0},{"insumoId":"imp10","qtd":2.0}],"81-[20-UND]":[{"insumoId":"imp0","qtd":0.141063},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp45","qtd":10.0},{"insumoId":"imp10","qtd":2.0}],"81-[30-UND]":[{"insumoId":"imp0","qtd":0.211594},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp45","qtd":15.0},{"insumoId":"imp10","qtd":2.0}],"81-[40-UND]":[{"insumoId":"imp0","qtd":0.282125},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp45","qtd":20.0},{"insumoId":"imp10","qtd":2.0}],"81-[50-UND]":[{"insumoId":"imp0","qtd":0.352656},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp45","qtd":25.0},{"insumoId":"imp10","qtd":2.0}],"81-[100-UND]":[{"insumoId":"imp0","qtd":0.705313},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp45","qtd":50.0},{"insumoId":"imp10","qtd":2.0}],"82-[1-UND]":[{"insumoId":"imp0","qtd":0.094042},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":4.22},{"insumoId":"imp10","qtd":2.0}],"82-[5-UND]":[{"insumoId":"imp0","qtd":0.470208},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":21.1},{"insumoId":"imp10","qtd":2.0}],"82-[10-UND]":[{"insumoId":"imp0","qtd":0.940417},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":42.2},{"insumoId":"imp10","qtd":2.0}],"83-CRU":[{"insumoId":"imp0","qtd":0.658292},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp45","qtd":12.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp9","qtd":1.0}],"83-BRANCO":[{"insumoId":"imp4","qtd":0.658292},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp12","qtd":1.0},{"insumoId":"imp45","qtd":12.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp9","qtd":1.0}],"84-CRU":[{"insumoId":"imp0","qtd":1.034458},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp8","qtd":1.0},{"insumoId":"imp45","qtd":15.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp9","qtd":2.0}],"84-BRANCO":[{"insumoId":"imp4","qtd":1.034458},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp8","qtd":1.0},{"insumoId":"imp45","qtd":15.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp9","qtd":2.0}],"85--1K-BRANCO":[{"insumoId":"imp4","qtd":0.141063},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp45","qtd":13.0},{"insumoId":"imp10","qtd":2.0}],"85--5K-BRANCO":[{"insumoId":"imp4","qtd":0.141063},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp45","qtd":13.0},{"insumoId":"imp10","qtd":2.0}],"85--10K-BRANCO":[{"insumoId":"imp4","qtd":0.141063},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp45","qtd":13.0},{"insumoId":"imp10","qtd":2.0}],"85--20K-BRANCO":[{"insumoId":"imp4","qtd":0.141063},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp25","qtd":1.0},{"insumoId":"imp42","qtd":1.0},{"insumoId":"imp45","qtd":13.0},{"insumoId":"imp10","qtd":2.0}],"86-CRU-[10-UND]":[{"insumoId":"imp0","qtd":0.080607},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":4.7858},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-CRU-[20-UND]":[{"insumoId":"imp0","qtd":0.161214},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":9.5716},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-CRU-[30-UND]":[{"insumoId":"imp0","qtd":0.241822},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":14.3574},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-CRU-[40-UND]":[{"insumoId":"imp0","qtd":0.322429},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":19.1432},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-CRU-[50-UND]":[{"insumoId":"imp0","qtd":0.403036},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":23.929},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-CRU-[100-UND]":[{"insumoId":"imp0","qtd":0.806072},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":47.858},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-BRANCO-[10-UND]":[{"insumoId":"imp4","qtd":0.080607},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":4.7858},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-BRANCO-[20-UND]":[{"insumoId":"imp4","qtd":0.161214},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":9.5716},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-BRANCO-[30-UND]":[{"insumoId":"imp4","qtd":0.241822},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":14.3574},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-BRANCO-[40-UND]":[{"insumoId":"imp4","qtd":0.322429},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":19.1432},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-BRANCO-[50-UND]":[{"insumoId":"imp4","qtd":0.403036},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":23.929},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"86-BRANCO-[100-UND]":[{"insumoId":"imp4","qtd":0.806072},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":47.858},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-CRU-[10-UND]":[{"insumoId":"imp0","qtd":0.080607},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":3.28572},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-CRU-[20-UND]":[{"insumoId":"imp0","qtd":0.161214},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":6.57144},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-CRU-[30-UND]":[{"insumoId":"imp0","qtd":0.241822},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":9.85716},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-CRU-[40-UND]":[{"insumoId":"imp0","qtd":0.322429},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":13.14288},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-CRU-[50-UND]":[{"insumoId":"imp0","qtd":0.403036},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":16.4286},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-CRU-[100-UND]":[{"insumoId":"imp0","qtd":0.806072},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":32.8572},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-BRANCO-[10-UND]":[{"insumoId":"imp4","qtd":0.080607},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":3.28572},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-BRANCO-[20-UND]":[{"insumoId":"imp4","qtd":0.161214},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":6.57144},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-BRANCO-[30-UND]":[{"insumoId":"imp4","qtd":0.241822},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":9.85716},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-BRANCO-[40-UND]":[{"insumoId":"imp4","qtd":0.322429},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":13.14288},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-BRANCO-[50-UND]":[{"insumoId":"imp4","qtd":0.403036},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":16.4286},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"87-BRANCO-[100-UND]":[{"insumoId":"imp4","qtd":0.806072},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":32.8572},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-CRU-[10-UND]":[{"insumoId":"imp0","qtd":0.14107},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":7.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-CRU-[20-UND]":[{"insumoId":"imp0","qtd":0.28214},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":14.5},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-CRU-[30-UND]":[{"insumoId":"imp0","qtd":0.42321},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":21.75},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-CRU-[40-UND]":[{"insumoId":"imp0","qtd":0.56428},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":29.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-CRU-[50-UND]":[{"insumoId":"imp0","qtd":0.70535},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":36.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-CRU-[100-UND]":[{"insumoId":"imp0","qtd":1.4107},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":72.5},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-BRANCO-[10-UND]":[{"insumoId":"imp4","qtd":0.14107},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":7.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-BRANCO-[20-UND]":[{"insumoId":"imp4","qtd":0.28214},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":14.5},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-BRANCO-[30-UND]":[{"insumoId":"imp4","qtd":0.42321},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":21.75},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-BRANCO-[40-UND]":[{"insumoId":"imp4","qtd":0.56428},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":29.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-BRANCO-[50-UND]":[{"insumoId":"imp4","qtd":0.70535},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":36.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"90-BRANCO-[100-UND]":[{"insumoId":"imp4","qtd":1.4107},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":72.5},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-CRU-[10-UND]":[{"insumoId":"imp0","qtd":0.313473},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":13.888889},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-CRU-[20-UND]":[{"insumoId":"imp0","qtd":0.626946},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":27.777778},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-CRU-[30-UND]":[{"insumoId":"imp0","qtd":0.940419},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":41.666667},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-CRU-[40-UND]":[{"insumoId":"imp0","qtd":1.253892},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":55.555556},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-CRU-[50-UND]":[{"insumoId":"imp0","qtd":1.567365},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":69.444445},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-CRU-[100-UND]":[{"insumoId":"imp0","qtd":3.13473},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":138.888889},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-BRANCO-[10-UND]":[{"insumoId":"imp4","qtd":0.313473},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":13.888889},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-BRANCO-[20-UND]":[{"insumoId":"imp4","qtd":0.626946},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":27.777778},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-BRANCO-[30-UND]":[{"insumoId":"imp4","qtd":0.940419},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":41.666667},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-BRANCO-[40-UND]":[{"insumoId":"imp4","qtd":1.253892},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":55.555556},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-BRANCO-[50-UND]":[{"insumoId":"imp4","qtd":1.567365},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":69.444445},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"91-BRANCO-[100-UND]":[{"insumoId":"imp4","qtd":3.13473},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":138.888889},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-CRU-[10-UND]":[{"insumoId":"imp0","qtd":0.11285},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":5.65},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-CRU-[20-UND]":[{"insumoId":"imp0","qtd":0.2257},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":11.3},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-CRU-[30-UND]":[{"insumoId":"imp0","qtd":0.33855},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":16.95},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-CRU-[40-UND]":[{"insumoId":"imp0","qtd":0.4514},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":22.6},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-CRU-[50-UND]":[{"insumoId":"imp0","qtd":0.56425},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":28.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-CRU-[100-UND]":[{"insumoId":"imp0","qtd":1.1285},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":56.5},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-BRANCO-[10-UND]":[{"insumoId":"imp4","qtd":0.11285},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":5.65},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-BRANCO-[20-UND]":[{"insumoId":"imp4","qtd":0.2257},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":11.3},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-BRANCO-[30-UND]":[{"insumoId":"imp4","qtd":0.33855},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":16.95},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-BRANCO-[40-UND]":[{"insumoId":"imp4","qtd":0.4514},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":22.6},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-BRANCO-[50-UND]":[{"insumoId":"imp4","qtd":0.56425},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":28.25},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"92-BRANCO-[100-UND]":[{"insumoId":"imp4","qtd":1.1285},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":56.5},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp11","qtd":4.0}],"93-CRU":[{"insumoId":"imp0","qtd":0.094042},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":3.5},{"insumoId":"imp10","qtd":2.0}],"93-CRU-[5-UND]":[{"insumoId":"imp0","qtd":0.470208},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":17.5},{"insumoId":"imp10","qtd":2.0}],"93-CRU-[10-UND]":[{"insumoId":"imp0","qtd":0.940417},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":35.0},{"insumoId":"imp10","qtd":2.0}],"93-BRANCO":[{"insumoId":"imp4","qtd":0.094042},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":3.5},{"insumoId":"imp10","qtd":2.0}],"93-BRANCO-[5-UND]":[{"insumoId":"imp4","qtd":0.470208},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":17.5},{"insumoId":"imp10","qtd":2.0}],"93-BRANCO-[10-UND]":[{"insumoId":"imp4","qtd":0.940417},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":35.0},{"insumoId":"imp10","qtd":2.0}],"94-CRU":[{"insumoId":"imp0","qtd":0.094042},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":3.5},{"insumoId":"imp10","qtd":2.0}],"94-CRU-[5-UND]":[{"insumoId":"imp0","qtd":0.470208},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":17.5},{"insumoId":"imp10","qtd":2.0}],"94-CRU-[10-UND]":[{"insumoId":"imp0","qtd":0.940417},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":35.0},{"insumoId":"imp10","qtd":2.0}],"94-BRANCO":[{"insumoId":"imp4","qtd":0.094042},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":3.5},{"insumoId":"imp10","qtd":2.0}],"94-BRANCO-[5-UND]":[{"insumoId":"imp4","qtd":0.470208},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":17.5},{"insumoId":"imp10","qtd":2.0}],"94-BRANCO-[10-UND]":[{"insumoId":"imp4","qtd":0.940417},{"insumoId":"imp5","qtd":1.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp45","qtd":35.0},{"insumoId":"imp10","qtd":2.0}],"95.0":[{"insumoId":"imp1","qtd":0.04238},{"insumoId":"imp0","qtd":0.12539},{"insumoId":"imp16","qtd":0.07501},{"insumoId":"imp45","qtd":10.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"96.0":[{"insumoId":"imp1","qtd":0.03426},{"insumoId":"imp0","qtd":0.09405},{"insumoId":"imp16","qtd":0.061},{"insumoId":"imp45","qtd":5.5},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"97.0":[{"insumoId":"imp1","qtd":0.040483},{"insumoId":"imp0","qtd":0.08681},{"insumoId":"imp16","qtd":0.402},{"insumoId":"imp45","qtd":7.0},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp11","qtd":4.0}],"99.0":[{"insumoId":"imp1","qtd":0.1472},{"insumoId":"imp0","qtd":0.047021},{"insumoId":"imp16","qtd":0.057},{"insumoId":"imp45","qtd":3.65},{"insumoId":"imp10","qtd":2.0},{"insumoId":"imp5","qtd":2.0},{"insumoId":"imp26","qtd":1.0},{"insumoId":"imp11","qtd":4.0}]};

const PRODUTOS_SEED = CATALOGO.map((c, ix) => ({
  id: "cat" + ix,
  sku: c.sku,
  nome: (c.desc || "").trim(),
  margem: 15, imposto: 7,
  custoManual: c.custo,
  peso: c.peso, alt: c.alt, larg: c.larg, comp: c.comp,
  itens: (FICHAS_SEED[c.sku] || []).map((it) => ({ id: uid(), ...it })),
}));

const SEED_VERSION = 7;

// ---------- FÁBRICAS: custo de máquina/minuto e montagem ----------
// Modela exatamente a lógica da sua planilha "Custo produção por fábrica":
// custo/min = ((custos fixos ÷ diasMes ÷ horasDia ÷ 60) + energia/min + manutenção/min + extras/min) ÷ nºMáquinas
const COLAB_LASER = [{"id":"cl0","nome":"CAROLINA BENTO SIQUEIRA","cargo":"EMBALADOR","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cl1","nome":"CINTIA JANAINA MACHADO","cargo":"EMBALADOR","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cl2","nome":"GABRIEL SACCHI VAZ","cargo":"GERENTE","salario":4770.0,"encargos":679.89,"bonus":500.0,"total":5949.89},{"id":"cl3","nome":"GABRIELA GASPARINI DA SILVA","cargo":"EMBALADOR","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cl4","nome":"JULIA THOMAZINI PEREIRA","cargo":"EMBALADOR","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cl5","nome":"SIMONY FORNEAS FONTES","cargo":"EMBALADOR","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cl6","nome":"TATIELE ALVES SANTANA","cargo":"ENCARREGADA","salario":2862.0,"encargos":535.89,"bonus":0,"total":3397.89},{"id":"cl7","nome":"TIAGO RODRIGUES TEIXEIRA","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cl8","nome":"VANILSON SANTOS DO NASCIMENTO","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":758.36,"total":3489.07}];
const COLAB_ROUTER = [{"id":"cr0","nome":"BEATRIZ MENDES DA ROCHA","cargo":"EMBALADOR","salario":2114.75,"encargos":319.89,"bonus":0,"total":2434.64},{"id":"cr1","nome":"BEATRIZ SANTOS DA SILVA","cargo":"EMBALADOR","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cr2","nome":"CAMILA SANTOS DE SANTANA","cargo":"AUXILIAR DE PRODUÇÃO","salario":2363.54,"encargos":498.68,"bonus":200.0,"total":3062.22},{"id":"cr3","nome":"DANYLLO BURATTO SILVEIRA","cargo":"GERENTE","salario":6000.0,"encargos":319.89,"bonus":0,"total":6319.89},{"id":"cr4","nome":"ELIANE DOS SANTOS BATISTA","cargo":"EMBALADOR","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cr5","nome":"ERIK PATRICK TOLEDO DE LIMA","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cr6","nome":"FABIO MACHADO DE ALMEIDA","cargo":"AUXILIAR DE PRODUÇÃO","salario":2114.75,"encargos":319.89,"bonus":0,"total":2434.64},{"id":"cr7","nome":"GEOVANE APARECIDO LAZARETE","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":319.89,"bonus":0,"total":2561.53},{"id":"cr8","nome":"GIOVANNA PRISCILA RODRIGUES","cargo":"ENCARREGADA","salario":3180.0,"encargos":559.89,"bonus":500.0,"total":4239.89},{"id":"cr9","nome":"KAUANE VICTÓRIA DOS SANTOS","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":200.0,"total":2930.71},{"id":"cr10","nome":"SIDINILVA ARAUJO BEARARI","cargo":"AUXILIAR DE LIMPEZA","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71}];
const COLAB_CILINDRO = [{"id":"cc0","nome":"ALANA BEATRIZ PEREIRA DA SILVA","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":200.0,"total":2930.71},{"id":"cc1","nome":"EDINAEL PEREIRA DA SILVA","cargo":"EMBALADOR","salario":2241.64,"encargos":489.07,"bonus":350.0,"total":3080.71},{"id":"cc2","nome":"JUCIELMA PINHEIRO PEREIRA","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":200.0,"total":2930.71},{"id":"cc3","nome":"LEONARDO SILVESTRE","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cc4","nome":"LUCAS EDUARDO PEREIRA","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71},{"id":"cc5","nome":"NATHAN SILVESTRE CIESTA","cargo":"AUXILIAR DE PRODUÇÃO","salario":2241.64,"encargos":489.07,"bonus":0,"total":2730.71}];

const FABRICAS_SEED = [
  {
    id: "laser", nome: "LASER",
    diasMes: 22, horasDia: 18, maquinas: 10,
    custosFixos: 52926,
    fixosDetalhe: [{"id": "fl0", "nome": "Aluguel", "valor": 2000.0}, {"id": "fl1", "nome": "Pagamento barracão novo", "valor": 13570.0}, {"id": "fl2", "nome": "Total Colaboradores", "valor": 29221.11, "auto": "colaboradores"}, {"id": "fl3", "nome": "Caçamba", "valor": 1650.0}, {"id": "fl4", "nome": "Relogio de ponto", "valor": 69.9}, {"id": "fl5", "nome": "Internet", "valor": 114.99}, {"id": "fl6", "nome": "Contabilidade", "valor": 900.0}, {"id": "fl7", "nome": "Vale alimentação", "valor": 3500.0}, {"id": "fl8", "nome": "Seguro de vida", "valor": 100.0}, {"id": "fl9", "nome": "Uniodonto", "valor": 400.0}, {"id": "fl10", "nome": "Agua", "valor": 300.0}, {"id": "fl11", "nome": "Ajuda de custo Gabriel Vaz", "valor": 100.0}, {"id": "fl12", "nome": "Caju", "valor": 1000.0}],
    extras: [
      { id: "le1", nome: "Energia", tipo: "horas", valorHora: 14 },
      { id: "le2", nome: "Manutenção mensal", tipo: "mensal", valorMes: 2000 },
    ],
    colaboradores: COLAB_LASER,
    insumoCorte: "CORTELASER",
    montagem: null,
  },
  {
    id: "router", nome: "ROUTER",
    diasMes: 22, horasDia: 9, maquinas: 3,
    custosFixos: 47555.19,
    fixosDetalhe: [{"id": "fr0", "nome": "Aluguel", "valor": 9270.0}, {"id": "fr1", "nome": "Água", "valor": 0}, {"id": "fr2", "nome": "Total Colaboradores", "valor": 34906.36, "auto": "colaboradores"}, {"id": "fr3", "nome": "Santa Rita Padaria", "valor": 1500.0}, {"id": "fr4", "nome": "Sindicato", "valor": 250.0}, {"id": "fr5", "nome": "Caçamba", "valor": 10000.0}, {"id": "fr6", "nome": "Relogio de ponto", "valor": 69.9}, {"id": "fr7", "nome": "Atacadão da agua", "valor": 1346.0}, {"id": "fr8", "nome": "Internet", "valor": 89.9}, {"id": "fr9", "nome": "Segurança", "valor": 100.0}, {"id": "fr10", "nome": "Contabilidade", "valor": 750.0}, {"id": "fr11", "nome": "Uniodonto", "valor": 207.29}, {"id": "fr12", "nome": "Vale alimentação", "valor": 6000.0}, {"id": "fr13", "nome": "Ajuda de custo Priscila", "valor": 100.0}, {"id": "fr14", "nome": "Caju", "valor": 100.0}],
    extras: [
      { id: "re1", nome: "Energia", tipo: "horas", valorHora: 6 },
      { id: "re2", nome: "Gastos fresas", tipo: "horas", valorHora: 5.5 },
      { id: "re3", nome: "Manutenção mensal", tipo: "mensal", valorMes: 2000 },
    ],
    colaboradores: COLAB_ROUTER,
    insumoCorte: "CORTEROUTER",
    montagem: {
      nome: "Montagem cilindro", insumoCodigo: "MONTCILINDRO",
      mediaDia: 200,
      colaboradores: COLAB_CILINDRO,
    },
  },
];

const SEED = { insumos: INSUMOS_SEED, produtos: PRODUTOS_SEED, marketplaces: MKT_SEED, fabricas: FABRICAS_SEED, fornecedores: FORNECEDORES_SEED, vendas: [], financeiro: [] };

// migra dados salvos anteriormente
function migrate(d) {
  if (!d || typeof d !== "object") return SEED;
  const out = { ...d };

  // Se os dados salvos são de uma versão de seed anterior, re-semeia insumos/marketplaces/fábricas
  // (que vêm das suas planilhas) SEM apagar os produtos que você já tiver ajustado.
  const versaoAntiga = (out._seedVersion || 0) < SEED_VERSION;

  if (!Array.isArray(out.insumos) || versaoAntiga) {
    // re-semeia insumos preservando o estoque lançado (casado por código)
    const antigosIns = {};
    for (const i of (Array.isArray(out.insumos) ? out.insumos : [])) antigosIns[i.codigo] = i;
    out.insumos = INSUMOS_SEED.map((si) => {
      const o = antigosIns[si.codigo];
      return o ? { ...si, estoque: o.estoque ?? 0, estoqueMin: o.estoqueMin ?? 0 } : si;
    });
  }
  if (!Array.isArray(out.fornecedores) || versaoAntiga) out.fornecedores = FORNECEDORES_SEED;
  if (!Array.isArray(out.marketplaces) || !out.marketplaces.length || versaoAntiga) out.marketplaces = MKT_SEED;
  if (!Array.isArray(out.fabricas) || !out.fabricas.length || versaoAntiga) out.fabricas = FABRICAS_SEED;
  if (!Array.isArray(out.vendas)) out.vendas = [];
  if (!Array.isArray(out.financeiro)) out.financeiro = [];

  // Produtos:
  // Extrai o SKU de um produto salvo: usa o campo sku se existir, senão tenta o prefixo do nome antigo ("SKU — nome")
  const extrairSku = (p) => {
    if (p.sku) return String(p.sku).trim();
    const m = String(p.nome || "").match(/^(.*?)\s+—\s+/);
    return m ? m[1].trim() : "";
  };
  const extrairNome = (p) => {
    if (p.sku) return p.nome; // já separado
    const m = String(p.nome || "").match(/^.*?\s+—\s+(.*)$/);
    return m ? m[1].trim() : (p.nome || "");
  };

  if (!Array.isArray(out.produtos) || !out.produtos.length) {
    out.produtos = PRODUTOS_SEED;
  } else if (versaoAntiga) {
    // Recarrega os produtos do catálogo (com fichas e SKU separado),
    // preservando margem/imposto/ficha própria dos produtos existentes, casados por SKU.
    const antigos = {};
    for (const p of out.produtos) {
      const sku = extrairSku(p);
      if (sku) antigos[sku.toUpperCase()] = p;
    }
    const seedSkus = new Set(PRODUTOS_SEED.map((p) => (p.sku || "").toUpperCase()));
    const recarregados = PRODUTOS_SEED.map((seed) => {
      const ant = antigos[(seed.sku || "").toUpperCase()];
      if (!ant) return seed;
      return {
        ...seed,
        margem: ant.margem ?? seed.margem,
        imposto: ant.imposto ?? seed.imposto,
        estoque: ant.estoque ?? 0,
        estoqueMin: ant.estoqueMin ?? 0,
        itens: (ant.itens && ant.itens.length) ? ant.itens : seed.itens,
      };
    });
    // mantém produtos criados pelo usuário (não estão no catálogo), separando sku/nome
    const extras = out.produtos
      .filter((p) => !seedSkus.has(extrairSku(p).toUpperCase()))
      .map((p) => ({ ...p, sku: extrairSku(p), nome: extrairNome(p) }));
    out.produtos = [...recarregados, ...extras];
  }

  out.marketplaces = out.marketplaces.map((m) => ({ extraNome: "", extraPct: 0, frete: [], prazoDias: 14, ...m }));
  out.insumos = out.insumos.map((i) => ({ estoque: 0, estoqueMin: 0, ...i }));
  out.produtos = out.produtos.map((p) => ({
    sku: "",
    peso: 0, alt: 0, larg: 0, comp: 0,
    imposto: p.imposto ?? 7,
    margem: p.margem ?? 15,
    custoManual: 0,
    estoque: 0, estoqueMin: 0,
    itens: [],
    ...p,
  }));
  out._seedVersion = SEED_VERSION;
  return out;
}

// ---------- cálculos ----------
const custoUnit = (ins) => (ins && num(ins.rendimento) > 0 ? num(ins.preco) / num(ins.rendimento) : 0);
const custoProduto = (p, insumos) =>
  (p.itens || []).length
    ? p.itens.reduce((s, it) => {
        const ins = insumos.find((i) => i.id === it.insumoId);
        return s + (ins ? custoUnit(ins) * num(it.qtd) : 0);
      }, 0)
    : num(p.custoManual);

const pesoCubico = (p) => (num(p.comp) * num(p.larg) * num(p.alt)) / 6000;
const pesoConsiderado = (p) => Math.max(num(p.peso), pesoCubico(p));

// ---------- CÁLCULO DE FÁBRICA ----------
// Custo/minuto da máquina, seguindo a lógica da sua planilha.
function custoMaquinaMinuto(fab) {
  const dias = num(fab.diasMes) || 22;
  const horas = num(fab.horasDia) || 1;
  const maquinas = num(fab.maquinas) || 1;
  const fixoMin = num(fab.custosFixos) / dias / horas / 60;
  let extrasMin = 0;
  for (const e of fab.extras || []) {
    if (e.tipo === "horas") extrasMin += num(e.valorHora) / 60;
    else if (e.tipo === "mensal") extrasMin += num(e.valorMes) / dias / horas / 60;
    else if (e.tipo === "minuto") extrasMin += num(e.valorMin);
  }
  const totalMin = fixoMin + extrasMin;
  return maquinas > 0 ? totalMin / maquinas : totalMin;
}

function totalColaboradores(lista) {
  return (lista || []).reduce((s, c) => s + num(c.total), 0);
}

// Custo da montagem (ex.: cilindro) = total colaboradores ÷ (média/dia × diasMes)
function custoMontagem(fab) {
  if (!fab.montagem) return null;
  const m = fab.montagem;
  // Se a lista de colaboradores está carregada (dono/financeiro/rh), usa ela.
  // Senão (setor 'vendas'), usa o total agregado guardado no balde principal —
  // assim o preço é calculado sem receber nome/salário de ninguém.
  const total =
    Array.isArray(m.colaboradores) && m.colaboradores.length
      ? totalColaboradores(m.colaboradores)
      : num(m.custoColaboradores);
  const div = num(m.mediaDia) * (num(fab.diasMes) || 22);
  return div > 0 ? total / div : 0;
}

// Aplica os custos calculados das fábricas nos insumos de produção correspondentes
function aplicarCustosFabrica(insumos, fabricas) {
  const mapa = {};
  for (const fab of fabricas || []) {
    if (fab.insumoCorte) mapa[fab.insumoCorte] = custoMaquinaMinuto(fab);
    if (fab.montagem?.insumoCodigo) mapa[fab.montagem.insumoCodigo] = custoMontagem(fab);
  }
  return insumos.map((i) =>
    mapa[i.codigo] != null ? { ...i, preco: mapa[i.codigo], rendimento: 1, _auto: true } : i
  );
}

function freteDaTabela(tabela, pesoKg) {
  if (!tabela || !tabela.length) return 0;
  const ordenada = [...tabela].sort((a, b) => (a.ate == null ? 1 : b.ate == null ? -1 : num(a.ate) - num(b.ate)));
  for (const f of ordenada) if (f.ate == null || pesoKg <= num(f.ate)) return num(f.valor);
  return num(ordenada[ordenada.length - 1].valor);
}

// Preço por marketplace: resolve a circularidade (a faixa de taxa depende do preço final)
// testando cada faixa e mantendo a solução consistente com ela.
function calcMarketplace(mp, custo, margemPct, impostoPct, pesoKg) {
  const freteBase = freteDaTabela(mp.frete, pesoKg);
  const extra = num(mp.extraPct);
  const faixas = [...(mp.faixas || [])].sort((a, b) => (a.ate == null ? 1 : b.ate == null ? -1 : num(a.ate) - num(b.ate)));
  if (!faixas.length) return { preco: NaN, frete: 0, taxas: NaN, lucro: NaN };
  let anterior = 0;
  let fallback = null;
  for (const f of faixas) {
    const div = 1 - (margemPct + impostoPct + num(f.pct) + extra) / 100;
    const frete = f.frete === false ? 0 : freteBase;
    if (div <= 0) { anterior = f.ate == null ? anterior : num(f.ate); continue; }
    const preco = (custo + frete + num(f.fixo)) / div;
    const ok = preco > anterior - 1e-9 && (f.ate == null || preco <= num(f.ate) + 1e-9);
    const res = {
      preco,
      frete,
      taxas: preco * ((num(f.pct) + extra) / 100) + num(f.fixo) + frete,
      imposto: preco * (impostoPct / 100),
      lucro: preco * (margemPct / 100),
      faixa: f,
    };
    if (ok) return res;
    fallback = res;
    anterior = f.ate == null ? anterior : num(f.ate);
  }
  return fallback ?? { preco: NaN, frete: 0, taxas: NaN, lucro: NaN };
}

// Taxas de um preço JÁ definido (para vendas registradas): acha a faixa do preço e soma % + fixo + frete
function taxasDoPreco(mp, precoUnit, pesoKg) {
  if (!mp) return 0;
  const freteBase = freteDaTabela(mp.frete, pesoKg);
  const extra = num(mp.extraPct);
  const faixas = [...(mp.faixas || [])].sort((a, b) => (a.ate == null ? 1 : b.ate == null ? -1 : num(a.ate) - num(b.ate)));
  for (const f of faixas) {
    if (f.ate == null || precoUnit <= num(f.ate) + 1e-9) {
      const frete = f.frete === false ? 0 : freteBase;
      return precoUnit * ((num(f.pct) + extra) / 100) + num(f.fixo) + frete;
    }
  }
  return 0;
}

// Fator de desconto do pedido (vendas do Tiny). O Tiny manda os itens com o preço
// CHEIO (de tabela) e o desconto (cupom do vendedor etc.) vem no nível do pedido:
// valor_total = produtos + frete − desconto. Este fator transforma o preço de
// tabela no preço realmente pago, rateando o desconto proporcionalmente entre os
// itens — assim receita, imposto, comissão e margem por item ficam reais.
function fatorDesconto(v) {
  const p = v.payload_raw || {};
  const totalItens = (v.itens || []).reduce(
    (s, it) => s + num(it.valor_unitario) * num(it.quantidade), 0);
  if (totalItens <= 0) return 1;
  // tenta os campos de desconto do payload (Tiny v2/v3); "10%" vira valor sobre os itens
  const rawDesc = p.valor_desconto ?? p.valorDesconto ?? p.desconto;
  let desc = String(rawDesc ?? "").trim().endsWith("%")
    ? totalItens * (num(rawDesc) / 100)
    : num(rawDesc);
  // fallback: deduz o desconto do próprio valor_total (= produtos + frete − desconto)
  if (!desc && num(v.valor_total) > 0) {
    const frete = num(p.valor_frete ?? p.valorFrete ?? p.frete);
    desc = Math.max(0, totalItens + frete - num(v.valor_total));
  }
  return Math.max(0, totalItens - desc) / totalItens;
}

const hojeISO = () => new Date().toISOString().slice(0, 10);
const addDias = (iso, dias) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + Math.round(num(dias)));
  return d.toISOString().slice(0, 10);
};
const fmtData = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");

// Lucro de uma venda registrada (com valores congelados no momento do registro)
function lucroVenda(v) {
  const receita = num(v.precoUnit) * num(v.qtd);
  const taxas = num(v.taxasUnit) * num(v.qtd);
  const imposto = receita * (num(v.impostoPct) / 100);
  const custo = num(v.custoUnit) * num(v.qtd);
  // Vendas com líquido real informado (ex.: TikTok merchant statement): o líquido é o próprio earnings
  const liquido = v.liquidoReal != null ? num(v.liquidoReal) : receita - taxas;
  return { receita, taxas, imposto, custo, lucro: liquido - imposto - custo, liquido };
}

// ---------- IMPORTADOR SHOPEE ----------
function normSku(s) {
  if (!s) return "";
  let n = String(s).trim().toUpperCase().replace(/\s+/g, "").replace(/\.+$/, "");
  return n.replace(/-+/g, "-");
}
// Casa um SKU do relatório com o SKU do catálogo (produtos), tentando variações
function casarSku(sku, produtos) {
  const idx = {};
  for (const p of produtos) if (p.sku) idx[normSku(p.sku)] = p;
  const n = normSku(sku);
  if (idx[n]) return idx[n];
  if (idx[n + ".0"]) return idx[n + ".0"];
  if (idx[normSku(n + ".0")]) return idx[normSku(n + ".0")];
  const m = n.match(/^(.*?)-?\[?(\d+)-?UN[ID]*\]?$/);
  if (m) {
    const base = m[1], q = m[2];
    for (const cand of [`${base}-[${q}-UND]`, `${base}-${q}UND`, `${base}-[${q}-UNID]`]) {
      if (idx[normSku(cand)]) return idx[normSku(cand)];
    }
  }
  return null;
}
const excelData = (v) => {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
};

// Índices das colunas do relatório da Shopee (padrão UpSeller/Shopee export, 64 colunas)
const COL = {
  id: 0, status: 1, criacao: 7, entregue: 11, completo: 12,
  sku: 17, qtd: 22, valorTotal: 42, txTransacao: 45, comLiquida: 47, servLiquida: 49,
};
// Recebimento Shopee = entrega + 7 dias (janela de proteção ao comprador). Fallback: conclusão.
function recebimentoShopee(row) {
  const st = String(row[COL.status] || "");
  const mDev = st.match(/devolução até\s*(\d{4}-\d{2}-\d{2})/i);
  if (mDev) return mDev[1];
  const ent = excelData(row[COL.entregue]);
  if (ent) return addDias(ent, 7);
  const comp = excelData(row[COL.completo]);
  if (comp) return addDias(comp, 7);
  return "";
}

// Processa as linhas de um relatório Shopee → vendas + estatísticas de importação
function processarShopee(linhas, produtos, insumos, jaImportados) {
  const vendas = [];
  const semSku = {};      // sku -> qtd (não casaram)
  const semReceb = [];
  let dup = 0, itensTotais = 0;
  for (const row of linhas) {
    const id = row[COL.id];
    if (!id || !row[COL.sku]) continue;
    itensTotais++;
    const chave = `${id}::${row[COL.sku]}::${row[COL.valorTotal]}`;
    if (jaImportados.has(chave)) { dup++; continue; }
    const prod = casarSku(row[COL.sku], produtos);
    if (!prod) { semSku[row[COL.sku]] = (semSku[row[COL.sku]] || 0) + num(row[COL.qtd]); continue; }
    const qtd = num(row[COL.qtd]) || 1;
    const valorTotal = num(row[COL.valorTotal]);        // valor do item (todas as unidades)
    const taxas = num(row[COL.comLiquida]) + num(row[COL.servLiquida]) + num(row[COL.txTransacao]);
    const receb = recebimentoShopee(row);
    if (!receb) semReceb.push(id);
    vendas.push({
      id: uid(),
      chave,
      data: excelData(row[COL.criacao]),
      produtoId: prod.id, sku: prod.sku, nomeProduto: prod.nome,
      canalId: "shopee", canalNome: "Shopee",
      qtd,
      precoUnit: qtd ? valorTotal / qtd : valorTotal,
      custoUnit: custoProduto(prod, insumos),
      taxasUnit: qtd ? taxas / qtd : taxas,
      impostoPct: num(prod.imposto),
      recebimento: receb || excelData(row[COL.criacao]),
      origem: "shopee-import",
    });
  }
  return { vendas, semSku, semReceb, dup, itensTotais };
}

// ---------- IMPORTADOR TIKTOK ----------
// O TikTok separa o "SKU ID" (nos relatórios de venda) do "seller_sku" (que casa com nosso catálogo).
// O template de edição em lote traz os dois lado a lado — usamos ele como dicionário.

// Extrai o mapa sku_id -> seller_sku do template "batch edit" (aba Template, dados a partir da linha 6)
function mapaTikTok(linhas) {
  const mapa = {};
  if (!linhas || !linhas.length) return mapa;
  // Localiza as colunas de sku_id e seller_sku pelo cabeçalho (linha 1 = nomes técnicos)
  let colSkuId = 5, colSeller = 11; // padrão do template
  const hdr = (linhas[0] || []).map((v) => String(v || "").trim().toLowerCase());
  const iSku = hdr.indexOf("sku_id");
  const iSeller = hdr.indexOf("seller_sku");
  if (iSku >= 0) colSkuId = iSku;
  if (iSeller >= 0) colSeller = iSeller;
  // Se não achou pelo cabeçalho técnico, tenta pela linha em português (linha 3)
  if (iSku < 0 && linhas[2]) {
    const hdrPt = linhas[2].map((v) => String(v || "").trim().toLowerCase());
    const jSku = hdrPt.findIndex((h) => h.includes("id do sku"));
    const jSeller = hdrPt.findIndex((h) => h.includes("sku do vendedor"));
    if (jSku >= 0) colSkuId = jSku;
    if (jSeller >= 0) colSeller = jSeller;
  }
  for (let i = 0; i < linhas.length; i++) {
    const row = linhas[i];
    if (!row) continue;
    const skuId = row[colSkuId];
    const sellerSku = row[colSeller];
    if (skuId && sellerSku && /^\d{6,}$/.test(String(skuId).trim())) {
      mapa[String(skuId).trim()] = String(sellerSku).trim();
    }
  }
  return mapa;
}

// Processa a MERCHANT STATEMENT do TikTok (profit_loss), resolvendo sku_id via mapa.
// Usa dados REAIS: "Order earnings" (líquido, já com todas as taxas do TikTok descontadas)
// e a data real de liquidação ("Order settled date", ou "Est. settlement time" se ainda não liquidou).
// Colunas (aba Orders, cabeçalho na linha que tem "Order ID"):
//   Order ID[0], SKU ID[1], SKU name[2], Product name[3], Order earnings[4], Order cost[5],
//   Net order margin[6], Items sold[7], Order paid date[8], ..., Order settled date[11],
//   ..., Est. settlement time[14], ..., Order status[16]
const parseDataTk = (v) => {
  if (!v) return "";
  const s = String(v).trim();
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
};
function processarTikTok(linhas, mapa, produtos, insumos, marketplaces, jaImportados) {
  // acha a linha de cabeçalho (a que começa com "Order ID")
  let hi = -1;
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i] && String(linhas[i][0] || "").trim() === "Order ID") { hi = i; break; }
  }
  const dados = hi >= 0 ? linhas.slice(hi + 1) : linhas;

  const vendas = [];
  const semSku = {};      // seller_sku que não casou
  const semMapa = new Set(); // sku_id sem seller_sku no dicionário
  let itensTotais = 0, cancelados = 0, dup = 0;
  for (const row of dados) {
    const orderId = row[0];
    const skuId = row[1];
    if (!orderId || !skuId || !/^\d{6,}$/.test(String(skuId).trim())) continue;
    const status = String(row[16] || "").trim();
    if (status === "Canceled") { cancelados++; continue; }
    itensTotais++;

    const chave = `tiktok::${orderId}::${skuId}`;
    if (jaImportados.has(chave)) { dup++; continue; }

    const qtd = num(row[7]) || 1;
    const earnings = num(row[4]);          // ganho líquido real (após taxas do TikTok)
    const sellerSku = mapa[String(skuId).trim()];
    if (!sellerSku) { semMapa.add(String(skuId).trim()); continue; }
    const prod = casarSku(sellerSku, produtos);
    if (!prod) { semSku[sellerSku] = (semSku[sellerSku] || 0) + qtd; continue; }

    const custoUnit = custoProduto(prod, insumos);
    // recebimento: data real de liquidação; se ainda não liquidou, usa a estimativa
    const receb = parseDataTk(row[11]) || parseDataTk(row[14]) || parseDataTk(row[8]);
    // Modelo: "líquido a receber" = earnings (TikTok já tirou as taxas). O lucro subtrai o custo de produção.
    // Guardamos taxasUnit=0 e usamos liquidoReal para o líquido/recebimento; o lucro sai de earnings - custo.
    vendas.push({
      id: uid(),
      chave,
      data: parseDataTk(row[8]),           // data do pagamento do pedido
      produtoId: prod.id, sku: prod.sku, nomeProduto: prod.nome,
      canalId: "tiktok", canalNome: "TikTok Shop",
      qtd,
      precoUnit: qtd ? earnings / qtd : earnings, // "preço" = ganho líquido unitário
      custoUnit,
      taxasUnit: 0,                        // taxas já embutidas no earnings
      impostoPct: 0,                       // idem (ICMS já está no earnings do TikTok)
      liquidoReal: earnings,               // valor real que cai na conta
      recebimento: receb,
      origem: "tiktok-statement",
    });
  }
  return { vendas, semSku, semMapa: [...semMapa], itensTotais, cancelados, dup };
}
// Converte "R$ 41.685,72" -> 41685.72
function parseBRL(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/R\$/g, "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
const inputCls = "border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 w-full";
const inputStyle = { borderColor: "#D8D0BF", color: "#111827" };
const miniInput = "border rounded-md px-2 py-1 text-sm bg-white w-full text-right";

const Field = ({ label, children, w }) => (
  <label className="flex flex-col gap-1" style={{ width: w }}>
    <span className="text-xs font-medium" style={{ color: "#6B7280" }}>{label}</span>
    {children}
  </label>
);

function ConfirmButton({ label, confirmLabel, onConfirm, style, className }) {
  const [arm, setArm] = useState(false);
  useEffect(() => {
    if (!arm) return;
    const t = setTimeout(() => setArm(false), 3500);
    return () => clearTimeout(t);
  }, [arm]);
  return (
    <button
      onClick={() => (arm ? (setArm(false), onConfirm()) : setArm(true))}
      className={className}
      style={arm ? { ...style, background: "#A33B2E", color: "#fff", borderColor: "#A33B2E" } : style}
    >
      {arm ? confirmLabel : label}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
      style={{ background: "rgba(28,32,26,0.45)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <h3 className="font-semibold" style={{ color: "#111827" }}>{title}</h3>
          <button onClick={onClose} className="text-2xl leading-none px-1" style={{ color: "#9CA3AF" }} aria-label="Fechar">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ---------- app ----------
export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("produtos");
  const [editInsumo, setEditInsumo] = useState(null);
  const [editForn, setEditForn] = useState(null);
  const [prodAberto, setProdAberto] = useState(null);
  const [mktAberto, setMktAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(true);
  const [setor, setSetor] = useState(null);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const email = (u?.user?.email || "").toLowerCase();
      let sx = email === "gabriel.noris1@gmail.com" ? "dono" : "restrito";
      if (email) {
        try {
          const { data: pf } = await supabase.from("perfis").select("setor").eq("email", email).maybeSingle();
          if (pf && pf.setor) sx = pf.setor;
        } catch (_e) { /* tabela pode nao existir ainda */ }
      }
      setSetor(sx);
    })();
  }, []);
  useEffect(() => {
    if (setor && !abasDoSetor(setor).includes(tab)) setTab(abasDoSetor(setor)[0]);
  }, [setor]);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("precificacao-v2");
        setData(migrate(JSON.parse(r.value)));
      } catch {
        setData(SEED);
      }
    })();
  }, []);

  useEffect(() => {
    if (!data) return;
    setSalvo(false);
    const t = setTimeout(async () => {
      try {
        await window.storage.set("precificacao-v2", JSON.stringify(data));
        setSalvo(true);
      } catch {
        setErro("Não consegui salvar. Suas alterações podem se perder ao fechar.");
      }
    }, 600);
    return () => clearTimeout(t);
  }, [data]);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F5F7" }}>
        <p style={{ color: "#6B7280" }}>Carregando seus dados…</p>
      </div>
    );

  const { produtos, marketplaces, fabricas, fornecedores, vendas, financeiro } = data;
  // Insumos de produção (corte/montagem) recebem o custo calculado das fábricas automaticamente
  const insumos = aplicarCustosFabrica(data.insumos, fabricas);
  const prod = produtos.find((p) => p.id === prodAberto);
  const abasVisiveis = abasDoSetor(setor);
  const soPreco = setor === "vendas";

  const setProduto = (id, patch) =>
    setData((d) => ({ ...d, produtos: d.produtos.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const setMkt = (id, patch) =>
    setData((d) => ({ ...d, marketplaces: d.marketplaces.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  const setFab = (id, patch) =>
    setData((d) => ({
      ...d,
      fabricas: d.fabricas.map((f) => {
        if (f.id !== id) return f;
        const nf = { ...f, ...patch };
        // Ao mexer na equipe de montagem, mantém o total agregado em dia. Esse
        // número (não a lista de salários) é o que vai para o balde principal e
        // permite ao setor 'vendas' calcular o custo de montagem.
        if (patch.montagem) {
          const mont = { ...patch.montagem };
          if (Array.isArray(mont.colaboradores) && mont.colaboradores.length) {
            mont.custoColaboradores = totalColaboradores(mont.colaboradores);
          }
          nf.montagem = mont;
        }
        return nf;
      }),
    }));
  const setInsumoCampo = (id, patch) =>
    setData((d) => ({ ...d, insumos: d.insumos.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const nomeFornecedor = (fid) => (fornecedores.find((f) => f.id === fid) || {}).nome || "";

  const registrarVenda = (v) =>
    setData((d) => ({
      ...d,
      vendas: [v, ...d.vendas],
      produtos: d.produtos.map((p) => (p.id === v.produtoId ? { ...p, estoque: num(p.estoque) - num(v.qtd) } : p)),
    }));
  const excluirVenda = (v) =>
    setData((d) => ({
      ...d,
      vendas: d.vendas.filter((x) => x.id !== v.id),
      produtos: d.produtos.map((p) => (p.id === v.produtoId ? { ...p, estoque: num(p.estoque) + num(v.qtd) } : p)),
    }));
  const addLancamento = (l) => setData((d) => ({ ...d, financeiro: [l, ...d.financeiro] }));
  const delLancamento = (id) => setData((d) => ({ ...d, financeiro: d.financeiro.filter((x) => x.id !== id) }));

  const importarShopee = (novasVendas) =>
    setData((d) => {
      // baixa estoque dos produtos vendidos
      const baixa = {};
      for (const v of novasVendas) baixa[v.produtoId] = (baixa[v.produtoId] || 0) + num(v.qtd);
      return {
        ...d,
        vendas: [...novasVendas, ...d.vendas],
        produtos: d.produtos.map((p) => baixa[p.id] ? { ...p, estoque: num(p.estoque) - baixa[p.id] } : p),
      };
    });

  const salvarInsumo = (ins) => {
    setData((d) => {
      const existe = d.insumos.some((i) => i.id === ins.id);
      return { ...d, insumos: existe ? d.insumos.map((i) => (i.id === ins.id ? ins : i)) : [...d.insumos, ins] };
    });
    setEditInsumo(null);
  };

  const excluirInsumo = (id) => {
    const usado = produtos.filter((p) => (p.itens || []).some((it) => it.insumoId === id));
    if (usado.length) {
      setErro(`Este insumo está na ficha técnica de: ${usado.map((p) => p.nome).join(", ")}. Remova-o dos produtos antes de excluir.`);
      return;
    }
    setData((d) => ({ ...d, insumos: d.insumos.filter((i) => i.id !== id) }));
  };

  const salvarFornecedor = (f) => {
    setData((d) => {
      const existe = d.fornecedores.some((x) => x.id === f.id);
      return { ...d, fornecedores: existe ? d.fornecedores.map((x) => (x.id === f.id ? f : x)) : [...d.fornecedores, f] };
    });
    setEditForn(null);
  };

  const excluirFornecedor = (f) => {
    const usado = insumos.filter((i) => i.fornecedorId === f.id);
    if (usado.length) {
      setErro(`${f.nome} está vinculado a ${usado.length} insumo(s). Troque o fornecedor deles antes de excluir. Os insumos não serão apagados — apenas ficarão sem fornecedor.`);
    }
    setData((d) => ({
      ...d,
      fornecedores: d.fornecedores.filter((x) => x.id !== f.id),
      insumos: d.insumos.map((i) => (i.fornecedorId === f.id ? { ...i, fornecedorId: "" } : i)),
    }));
  };

  const novoProduto = () => {
    const p = { id: uid(), sku: "", nome: "Novo produto", margem: 35, imposto: 7, peso: 0, alt: 0, larg: 0, comp: 0, itens: [] };
    setData((d) => ({ ...d, produtos: [...d.produtos, p] }));
    setProdAberto(p.id);
  };

  const duplicarProduto = (orig) => {
    const novo = {
      ...orig,
      id: uid(),
      sku: orig.sku ? orig.sku + "-COPIA" : "",
      nome: orig.nome + " (cópia)",
      estoque: 0,
      // clona a ficha técnica com ids próprios para não compartilhar referência
      itens: (orig.itens || []).map((it) => ({ ...it, id: uid() })),
    };
    setData((d) => {
      const ix = d.produtos.findIndex((x) => x.id === orig.id);
      const arr = [...d.produtos];
      arr.splice(ix + 1, 0, novo); // insere logo após o original
      return { ...d, produtos: arr };
    });
    setProdAberto(novo.id);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7", color: "#111827", fontFamily: "'Avenir Next','Segoe UI',system-ui,sans-serif" }}>
      <header style={{ background: "#1E2125", borderBottom: "1px solid #2A2E33" }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAABwCAYAAAB1qNxRAAAL/UlEQVR42u2dX2gbyR3Hv2Nkn4q8tPdwyKW0R5KHhiNQaDncl6Z9KPFLoodGxyVQuHswLghXElRwVYIRwlzco4KzfUJQIQqBFl2IzIEaaGXKtZd7qXq4UHIE98E+rr0H66Vp2Yioicj2QZrN7Hr/zK5mVitHPzCxY1na/ex3vvOb38zOEoQ8VFXFnRtvAQAuXnsH84oC4vO9ctlVfOdLTxFb6Ov/F49F0en2AECj38djUQAwfM8Thwd9cnWjAg0wHCMJK9xcdhWvnZvB4vK25e/r+RROn4lQQEJh+Y1Ot4fuUYTsPZrBL98tg5AQQ27X0jrcej6F2EIf8VhUCwrWqKATmSqp51O4ulEJH2StUAApFlmlapjAuP3pU1JY38D8vAJCgJmwHFg9n9IBN7dWJhYwAJw/9VhTFAXvX0uFQ8nNrRUkMlX9+3gsOrFwzZ3gxWvvQFEURMaZNdy/dR2Ly9u0kzsRcGnEFvpQFAX1fGo8kNu1NBRFYdR7sgAPsx0tl10lF69tBAs5l13Fxi9exGx0faI7Ng/eDEVRguv46vkUSptlzEbXJ75js0vd6L+dbo+w/Z30ju+kdGwUImXGDH7087MLaXahAXg/n0IiU6GAtUkYSMRjUcIA5YJo1akDQGu3heTlpBzIza0VkEwV2KiEQr10pGhWIwDc/WwOpc2yp/dr7DSwdGHJrCmrIKqqirULtt4QZMfmBtGpBmJ3Ht/93g9YkF7Pg9DsSagns2P1ANRraNLxWNQTRAs1CjnW4lqe0Fahqqqepo4MWSsU8DCXg6IogVjD7U+fEp7m3dhp4CvfeBmLZ88KBWkVrd0WSV5OGvxYmJKDVG+n2yNsB5TLrqKwvsHjizJDtwUruCNBDjItM8NlTkjUZxJGkUheTlIr0fwqd6QUTtOA/+00EE0mpdcbBMMlFCIAUEBWFqOqqjaqcn1DrudTIKQCICm13tDp9nD3szlS2qx6hauD/MvHf3ZNy1hIbso1wy2u5bngckMOst4wmCPjhkucTpRCNDVzLF1YgqIoUBQF7VpainI9eXKvMbAG2d5rtoZ2LY1XXn/bDvCxE7cKMwyaspn+VpMJ11HJNGuIJpOBwnU7eZqHejlx82u9wG3ttkaCawmZ1huYtExKvYHO6vJag7k3nxS4x+wiqLTMrF6XTsdzs/UL18sF9KVkClhmWmZjDVxweXpzM1y3i1dcy8M8BJYBGAAi9APatbSUUZNs3zU372GnGQq4BruQ4b3PfLci1Xc5lWt4/8ZOA8kfXYa+xEf22FsSYN++65b7srkuU8Pghsv+bVAREQl4FN81W4O5AGTVrL20jFFz3ZGU3K6lNRHWMBgKl3kAuA4m7GAwNWDpozTh2UVQQ2GqLhbuiEBDDXdkyH5918UWfFXYwgrXN2S/vmtS56jpIqG13zDD1SHzrvn1WIIk929dxyuvvy2iwG4A6jQACWtEhrmyJqrOQFU6rKJ5ztntgJo7yvu3roceLtdgxKPvCgNqzjrYURpv/hwqJWsAfmdSs0ff5WrudrMVLFA3UOzKHOrtdvlze38fi2fPhgJ6hACoH0XQWRh482DK3fPUj6t/miEBsAU6Qv5sCz0USn/jje8fOzBVVTWbL6iqisZOw7EJ09fQ760il13Vf+/0OgqTeZ3m8mX7XuxxBebJNNq1NP714nmz73rqkOz8066p24FnlkkJnfp3azkylE7MFS0K2q1DsvNZLzBF584e/z4w6MSpubt5osUqHi7fFAAT7f19/PDVV0UNyaVCJ3aArWZ7aWcVYFMn7f19/OG3N21TOB4x+IVudyEN0OfnXevSI1WtRauT1/d173/3PcsTNL9WFHQepVu9hniEqYmwJyeYvOr0EuOAzp5jxO3gaE7r5wDcRmu8g4tRw6bYb/V74gG6ZnovIuz4mVzVNU/NZVcdc+ewBE+eznnO+tcfP/lEHwPY3mJGATW3VtDcWtF/Tl5O0qtFWrst4mA5WmF9Qwfe2GnoV5ktUY4DtnkARI+LVaFZTF5b8n/++bneSmw9mS7VMhePOt0esbp9wIOvHRt6yxwMuPmxRSrq+f4QWhW0uqUil13lKtobkny6sqi5tQIA5Kf/SODzykUWGmFOzOqAtaULS/TkiXlJ1KjArSZgHcD7molxqh7+6dc/09+b3ixkq2S6qohn0cvwJhlidb+bhxM61lu7AWcLP7JU6pQJNXYamPti1yA+KzZC7uMb2onWrqWPAWd7bjeFM2AtFc4CtYM6YrrpCHXYenWV4sFdgGNWyRWy1y1pKHBqJ8CzOzpZ4C4wHC1F0GCIuJUB3FTK+zmudiFqhefwpm7LW2i9dJqjAOVs+hojFiFFOFcld48iwBkhlmLoMFngbKfppnDeE5tttfS7BI6/i4bm9k/0VgeAu+kLr8LJXO3JKrx7FAG7MNGjwl1VynjpMz8NKDrdHhk7ZHOGwgHctfZxrIMaY3BBHtdd/p1uj/Dcwf9y6g7e+2bTYCdh2vLh8KDvDjmXXcX5U4/Hpgiq8Ev//ioe5nJo7bYw98Wu0U9DHJ1uj8yE/SDjsSjisahGikUoioKvP7hLW9ZE7AATj0XtC0Q0fyxtlkO/dWPYY2aKQL7dTSFLju5RhA+yeeOjaXjqtJ0hh2n2YhIjHoti79GMM2S6A/e04/Mfpc3y1JNlRy67OvXkICIyRSC34yttVuVBpsNhhKBIE2ol00dFxGNRrysmkchUaV2EDOsfJ2aXb1l2oflQMZpbKxiULssoDYEPy5ChVDf7OA1RKZwr5O5RhH448aLCeCyKXHYViUxZv0J/HdSl6doEwj7aIgyAKx//ndy8+REAQMSt0NKVDAx2wS4xP7MLP9jniFB1O8GWnd10uj3cvPmRflyin2fCmyd7XmJ7KV3V80QytI52La01t1Z0wKqqol1LI5GpYnF5mxwe9IkV0O5RhGiFglTQmkT74e34PH/A4BkbFZQ2y4bZlXgsStdnGHZRYdRNgMEyMQD6VNSeafGi6CAA2pOUJw+uYMRRKPFYVHvtHHB+OHtN1f2kt4a//ea/utpN1nJysws/C1w6C4b9jW1TQNPqIzIbXdd/x1rLpBaIuLMLP2sv/FgMYyXoHkVIIlMxPA9qUsOx49t7NGPw5lE7AC8X6PSZiNbcWgEpFs3rJk4WZLoa0o8qRaRd8VhUa26taIlMFedPPZYKgi5yF1lD5yrajxLUakT4Grv7oqwobZbx7R9/Wd4Oh3YxPz/4wMODPk6f8QYtttAX2cw1SHzwDL2Q9Gk+oof8XEreezTjq/knMlUhCgyizkGtSeQwf5hVOSuZkMEW62++eQ/xc9/yc9BkUlb6yLyYXEqmhRM/6pgUwGPLLqYRUHbx8KEqLCV7XmM6x2dUndDpMprGukKebbWeC8DsdJmonXjpSNkV8gd7HwaWRo0z2PxYlDXS95vx2JxObNB8XkbVzxXylbmX9LR56tySsgtSLA4nRav6vXjT8NbxcdlFabMMrVBAIlPF4UF/CppTxVc3KnjSW+P3ZFrXvbpRweLyNpmq2h2ZqqrI//yBtxFfIlOFpg2eCUVnmKewj8O9/elTkshUMT+voLRZ9j4YGdyUloRWKKCff4rZ6DratTTpdHvP9Zo3qydfElIebcRHikWgaJjsJJP88G+/YNkbOlVVxZ0bb+HKjYoOWMiwml49dt3ESYZttYFKr9HAC/fugQxnVa5uSKpdLC5v61dy+NT1EwPbCiyd9bmUqYIkk45/L7RAROfH2Mcs1/MpElvoT4Rfm0e1z3YwqBrsYO/RjL6YkiekVOEGfl0cToBOjqovfO0CgOrwAQnbBjv4YO9D35OsUkudtHnV86mwwyYA8MK9e/rg60lvDb//VYfLDrjePIhgH2hLPc0L7MXlbUI7WAia0uLd7kF6gUhUlDbL+pS7qqpjG6J3uj1yeNAni8vbJJGp6iUD6c1kHMGu1uRR9ahKNg8WDNmB5HMd2/TT4vK24YnuMvzayg7q+ZTn7GBiIbNDdJNfO07/cCzjJcPpJAPYK3MvgRSLlvsbBdKrhiXYNW/DG3eoqkkiU9XzVKunwI/TDiYKMqs8K8Wxm08NfdnWDmRnDF7i/1jd8SDE80koAAAAAElFTkSuQmCC" alt="Galuno Artesanato"
              style={{ height: 64, width: "auto", flexShrink: 0 }} />
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-white" style={{ letterSpacing: "0.08em" }}>Galuno Artesanato</h1>
          </div>
          <p className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: salvo ? "rgba(22,163,74,0.18)" : "rgba(245,158,11,0.18)", color: salvo ? "#86EFAC" : "#FCD34D" }}>{salvo ? "✓ Tudo salvo" : "Salvando…"}</p>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex flex-wrap gap-1">
          {[["produtos", "Produtos e Preços"], ["tempo-real", "Vendas"], ["financeiro", "Financeiro"], ["relatorios", "Relatórios"], ["estoque", "Estoque"], ["insumos", "Insumos"], ["fornecedores", "Fornecedores"], ["fabricas", "Fábricas"], ["rh", "RH"], ["marketplaces", "Marketplaces"], ["usuarios", "Usuários"], ["ajuda", "Como usar"]].filter(([k]) => abasVisiveis.includes(k)).map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setProdAberto(null); }}
              className="px-3 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap"
              style={tab === k ? { background: "#F4F5F7", color: "#1D4ED8", boxShadow: "inset 0 2px 0 #2563EB" } : { color: "#94A3B8" }}>
              {l}
            </button>
          ))}
        </nav>
      </header>

      {erro && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="rounded-lg px-4 py-3 text-sm flex justify-between gap-4"
            style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
            <span>{erro}</span>
            <button onClick={() => setErro("")} className="font-bold">×</button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ============ LISTA DE PRODUTOS ============ */}
        {tab === "produtos" && !prod && (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <input
                className={inputCls + " max-w-xs"}
                style={inputStyle}
                placeholder="Buscar por SKU ou nome…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <button disabled={soPreco} onClick={novoProduto} className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: "#2563EB" }}>
                + Novo produto
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {produtos
                .filter((p) => ((p.sku || "") + " " + p.nome).toLowerCase().includes(busca.toLowerCase()))
                .slice(0, busca ? 200 : 40)
                .map((p) => {
                const custo = custoProduto(p, insumos);
                const pc = pesoConsiderado(p);
                return (
                  <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition-shadow relative group" style={{ borderColor: "#E5E7EB" }}>
                    <button onClick={() => setProdAberto(p.id)} className="text-left w-full">
                      <div className="flex items-start gap-2 mb-2 pr-8">
                        {p.sku && <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded whitespace-nowrap" style={{ background: "#EEF2F7", color: "#374151" }}>{p.sku}</span>}
                        <p className="font-semibold leading-tight">{p.nome}</p>
                      </div>
                      <div className="flex items-baseline justify-between text-sm">
                        <span style={{ color: "#6B7280" }}>Custo de produção</span>
                        <span className="text-lg font-bold" style={{ color: "#2563EB" }}>{BRL(custo)}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                        {(p.itens || []).length} insumo(s) · peso considerado {KG(pc)}
                      </p>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); duplicarProduto(p); }}
                      title="Duplicar produto"
                      className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: "#EEF2F7", color: "#374151" }}
                      aria-label="Duplicar produto">+</button>
                  </div>
                );
              })}
              {!produtos.length && (
                <div className="sm:col-span-2 bg-white rounded-2xl p-8 text-center border" style={{ borderColor: "#E5E7EB", color: "#6B7280" }}>
                  Nenhum produto ainda. Toque em "+ Novo produto" para começar.
                </div>
              )}
              {produtos.length > 0 && (
                <p className="sm:col-span-2 text-xs text-center" style={{ color: "#9CA3AF" }}>
                  {produtos.filter((p) => ((p.sku || "") + " " + p.nome).toLowerCase().includes(busca.toLowerCase())).length} de {produtos.length} produtos
                  {!busca && produtos.length > 40 ? " — mostrando os 40 primeiros, use a busca para encontrar os demais" : ""}
                </p>
              )}
            </div>
          </>
        )}

        {/* ============ DETALHE DO PRODUTO ============ */}
        {tab === "produtos" && prod && (() => {
          const custo = custoProduto(prod, insumos);
          const cubico = pesoCubico(prod);
          const bruto = num(prod.peso);
          const pc = Math.max(bruto, cubico);
          const cubicoMaior = cubico > bruto;
          const divDireta = 1 - (num(prod.margem) + num(prod.imposto)) / 100;
          const precoDireta = divDireta > 0 ? custo / divDireta : NaN;
          return (
            <div className="space-y-5">
              <button onClick={() => setProdAberto(null)} className="text-sm font-medium" style={{ color: "#1F2937" }}>← Voltar aos produtos</button>

              <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
                <div className="flex flex-wrap gap-3 items-end justify-between">
                  <div className="flex flex-wrap gap-3 items-end">
                    <Field label="SKU / Código" w="140px">
                      <input className={inputCls} style={inputStyle} value={prod.sku || ""} placeholder="Ex.: 2.0" disabled={soPreco}
                        onChange={(e) => setProduto(prod.id, { sku: e.target.value })} />
                    </Field>
                    <Field label="Nome do produto" w="min(320px,100%)">
                      <input className={inputCls} style={inputStyle} value={prod.nome} disabled={soPreco} onChange={(e) => setProduto(prod.id, { nome: e.target.value })} />
                    </Field>
                    <Field label="Empresa" w="130px">
                      <select className={inputCls} style={inputStyle} disabled={soPreco}
                        value={prod.empresa || empresaDoSku(prod.sku)}
                        onChange={(e) => setProduto(prod.id, { empresa: e.target.value })}>
                        <option value="LASER">LASER</option>
                        <option value="ROUTER">ROUTER</option>
                      </select>
                    </Field>
                  </div>
                  <div className="flex gap-2" style={{ display: soPreco ? "none" : "flex" }}>
                    <button onClick={() => duplicarProduto(prod)}
                      className="text-sm px-3 py-2 rounded-lg border" style={{ color: "#374151", borderColor: "#D8D0BF" }}>
                      Duplicar
                    </button>
                    <ConfirmButton label="Excluir produto" confirmLabel="Toque de novo para confirmar"
                      onConfirm={() => { setData((d) => ({ ...d, produtos: d.produtos.filter((x) => x.id !== prod.id) })); setProdAberto(null); }}
                      className="text-sm px-3 py-2 rounded-lg border" style={{ color: "#A33B2E", borderColor: "#E5C7C1" }} />
                  </div>
                </div>
              </div>

              {/* ficha técnica */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
                <h3 className="font-semibold mb-1">Ficha técnica</h3>
                <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>O que entra em 1 unidade deste produto. Os custos vêm do cadastro de insumos.</p>
                <div className="space-y-2">
                  {(prod.itens || []).map((it) => {
                    const ins = insumos.find((i) => i.id === it.insumoId);
                    const sub = ins ? custoUnit(ins) * num(it.qtd) : 0;
                    return (
                      <div key={it.id} className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#F8FAFC" }}>
                        <select className={inputCls + " flex-1 min-w-[180px]"} style={inputStyle} disabled={soPreco} value={it.insumoId}
                          onChange={(e) => setProduto(prod.id, { itens: prod.itens.map((x) => x.id === it.id ? { ...x, insumoId: e.target.value } : x) })}>
                          {insumos.map((i) => <option key={i.id} value={i.id}>{i.codigo} — {i.descricao}</option>)}
                        </select>
                        <div className="flex items-center gap-1">
                          <input type="number" step="any" className={inputCls + " w-24 text-right"} style={inputStyle} disabled={soPreco} value={it.qtd}
                            onChange={(e) => setProduto(prod.id, { itens: prod.itens.map((x) => x.id === it.id ? { ...x, qtd: e.target.value } : x) })} />
                          <span className="text-xs w-8" style={{ color: "#9CA3AF" }}>{ins?.unidUso}</span>
                        </div>
                        <span className="text-sm font-semibold w-24 text-right">{BRL(sub)}</span>
                        <button disabled={soPreco} onClick={() => setProduto(prod.id, { itens: prod.itens.filter((x) => x.id !== it.id) })}
                          className="px-2 text-lg" style={{ color: "#A33B2E" }} aria-label="Remover linha">×</button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                  <button disabled={soPreco}
                    onClick={() => insumos.length
                      ? setProduto(prod.id, { itens: [...(prod.itens || []), { id: uid(), insumoId: insumos[0].id, qtd: 1 }] })
                      : setErro("Cadastre pelo menos um insumo primeiro (aba Insumos).")}
                    className="text-sm font-semibold px-3 py-2 rounded-lg" style={{ color: "#1F2937", background: "#EEF2F7" }}>
                    + Adicionar insumo
                  </button>
                  <div className="flex items-center gap-3 flex-wrap">
                    {!(prod.itens || []).length && (
                      <label className="flex items-center gap-2 text-xs" style={{ color: "#6B7280" }}>
                        Custo importado da planilha (R$)
                        <input type="number" step="any" className={inputCls + " w-28 text-right"} style={inputStyle} disabled={soPreco}
                          value={prod.custoManual}
                          onChange={(e) => setProduto(prod.id, { custoManual: e.target.value })} />
                      </label>
                    )}
                    <p className="text-sm">Custo de produção: <strong>{BRL(custo)}</strong></p>
                  </div>
                </div>
                {!(prod.itens || []).length && (
                  <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
                    Este produto usa o custo importado da sua planilha. Se você adicionar insumos na ficha técnica, o custo passa a ser calculado por eles.
                  </p>
                )}
              </div>

              {/* embalagem e peso */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
                <h3 className="font-semibold mb-1">Pacote embalado</h3>
                <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
                  Medidas do pacote pronto para envio. Peso cúbico = comprimento × largura × altura ÷ 6000. O frete usa sempre o maior entre peso bruto e cúbico.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[["peso", "Peso bruto (kg)"], ["comp", "Comprimento (cm)"], ["larg", "Largura (cm)"], ["alt", "Altura (cm)"]].map(([k, l]) => (
                    <Field key={k} label={l}>
                      <input type="number" step="any" className={inputCls} style={inputStyle} value={prod[k]} disabled={soPreco}
                        onChange={(e) => setProduto(prod.id, { [k]: e.target.value })} />
                    </Field>
                  ))}
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl px-4 py-3" style={{ background: !cubicoMaior && bruto > 0 ? "#EEF2F7" : "#F8FAFC", border: !cubicoMaior && bruto > 0 ? "1px solid #CBBEA0" : "1px solid #E5E7EB" }}>
                    <p className="text-xs" style={{ color: "#6B7280" }}>Peso bruto</p>
                    <p className="font-bold">{KG(bruto)}</p>
                  </div>
                  <div className="rounded-xl px-4 py-3" style={{ background: cubicoMaior ? "#EEF2F7" : "#F8FAFC", border: cubicoMaior ? "1px solid #CBBEA0" : "1px solid #E5E7EB" }}>
                    <p className="text-xs" style={{ color: "#6B7280" }}>Peso cúbico (C×L×A ÷ 6000)</p>
                    <p className="font-bold">{KG(cubico)}</p>
                  </div>
                  <div className="rounded-xl px-4 py-3" style={{ background: "#1F2937", color: "#fff" }}>
                    <p className="text-xs" style={{ color: "#D8CFBC" }}>Peso considerado {cubicoMaior ? "→ cúbico venceu" : bruto > 0 ? "→ bruto venceu" : ""}</p>
                    <p className="font-bold" style={{ color: "#F0C05A" }}>{KG(pc)}</p>
                  </div>
                </div>
              </div>

              {/* precificação por marketplace */}
              <div className="rounded-2xl p-5 shadow-sm border" style={{ background: "#1F2937", borderColor: "#1F2937" }}>
                <h3 className="font-semibold mb-4 text-white">Precificação por canal</h3>
                <div className="grid grid-cols-2 gap-3 mb-5 max-w-sm">
                  {[["margem", "Margem de lucro (%)"], ["imposto", "Imposto (%)"]].map(([k, l]) => (
                    <label key={k} className="flex flex-col gap-1">
                      <span className="text-xs" style={{ color: "#D8CFBC" }}>{l}</span>
                      <input type="number" step="any" className="rounded-lg px-3 py-2 text-sm bg-white" style={{ color: "#111827" }}
                        value={prod[k]} onChange={(e) => setProduto(prod.id, { [k]: e.target.value })} />
                    </label>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-xl" style={{ background: "#2B2723" }}>
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr style={{ color: "#D8CFBC" }}>
                        {["Canal", "Taxas + frete do canal", "Lucro por venda", "PREÇO DE VENDA"].map((h, i) => (
                          <th key={h} className={"px-4 py-3 font-semibold " + (i === 0 ? "text-left" : "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {marketplaces.map((m) => {
                        const r = calcMarketplace(m, custo, num(prod.margem), num(prod.imposto), pc);
                        return (
                          <tr key={m.id} className="border-t" style={{ borderColor: "#374151" }}>
                            <td className="px-4 py-3 font-semibold text-white">{m.nome}</td>
                            <td className="px-4 py-3 text-right" style={{ color: "#D8CFBC" }}>
                              {isNaN(r.taxas) ? "rever %" : BRL(r.taxas)}
                              {r.frete > 0 && <span className="block text-xs" style={{ color: "#9CA3AF" }}>inclui frete {BRL(r.frete)} ({KG(pc)})</span>}
                            </td>
                            <td className="px-4 py-3 text-right text-white">{isNaN(r.lucro) ? "—" : BRL(r.lucro)}</td>
                            <td className="px-4 py-3 text-right text-lg font-bold" style={{ color: "#F0C05A" }}>{isNaN(r.preco) ? "rever %" : BRL(r.preco)}</td>
                          </tr>
                        );
                      })}
                      <tr className="border-t" style={{ borderColor: "#374151" }}>
                        <td className="px-4 py-3 font-semibold text-white">Venda direta <span className="text-xs font-normal" style={{ color: "#9CA3AF" }}>(sem marketplace)</span></td>
                        <td className="px-4 py-3 text-right" style={{ color: "#D8CFBC" }}>R$ 0,00</td>
                        <td className="px-4 py-3 text-right text-white">{isNaN(precoDireta) ? "—" : BRL(precoDireta * num(prod.margem) / 100)}</td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-white">{isNaN(precoDireta) ? "rever %" : BRL(precoDireta)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs mt-3" style={{ color: "#9CA3AF" }}>
                  Preço = (custo + frete do canal + taxa fixa) ÷ (1 − margem − imposto − comissão %). A faixa de comissão é escolhida automaticamente pelo preço final. Edite as taxas na aba Marketplaces.
                </p>
              </div>
            </div>
          );
        })()}

        {/* ============ VENDAS ============ */}
        {tab === "vendas" && (() => {
          const hoje = hojeISO();
          const d7 = addDias(hoje, -7);
          const mes = hoje.slice(0, 7);
          const soma = (arr, f) => arr.reduce((s, v) => s + f(v), 0);
          const lucroHoje = soma(vendas.filter((v) => v.data === hoje), (v) => lucroVenda(v).lucro);
          const lucro7 = soma(vendas.filter((v) => v.data >= d7), (v) => lucroVenda(v).lucro);
          const lucroMes = soma(vendas.filter((v) => (v.data || "").slice(0, 7) === mes), (v) => lucroVenda(v).lucro);
          const aReceber = soma(vendas.filter((v) => v.recebimento > hoje), (v) => lucroVenda(v).liquido);
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[["Lucro hoje", lucroHoje], ["Lucro 7 dias", lucro7], ["Lucro no mês", lucroMes], ["A receber (líquido)", aReceber]].map(([l, v]) => (
                  <div key={l} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
                    <p className="text-xs" style={{ color: "#6B7280" }}>{l}</p>
                    <p className="text-xl font-bold" style={{ color: v >= 0 ? "#1F2937" : "#A33B2E" }}>{BRL(v)}</p>
                  </div>
                ))}
              </div>

              <ImportadorShopee produtos={produtos} insumos={insumos} vendas={vendas} onImport={importarShopee} setErro={setErro} />

              <ImportadorTikTok produtos={produtos} insumos={insumos} marketplaces={marketplaces} vendas={vendas} onImport={importarShopee} setErro={setErro} />

              <CalendarioRecebimentos vendas={vendas} />

              <VendaForm produtos={produtos} marketplaces={marketplaces} insumos={insumos} onSave={registrarVenda} />

              <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto" style={{ borderColor: "#E5E7EB" }}>
                <table className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr style={{ background: "#EEF2F7", color: "#374151" }}>
                      {["Data", "Produto", "Canal", "Qtd", "Receita", "Taxas+Imp.", "Lucro", "Recebimento", ""].map((h) => (
                        <th key={h} className="text-left px-3 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vendas.slice(0, 100).map((v) => {
                      const r = lucroVenda(v);
                      const recebido = v.recebimento <= hoje;
                      return (
                        <tr key={v.id} className="border-t" style={{ borderColor: "#EFE9DC" }}>
                          <td className="px-3 py-2 whitespace-nowrap">{fmtData(v.data)}</td>
                          <td className="px-3 py-2"><span className="font-mono text-xs font-semibold mr-1" style={{ color: "#374151" }}>{v.sku}</span>{v.nomeProduto}</td>
                          <td className="px-3 py-2">{v.canalNome}</td>
                          <td className="px-3 py-2">{v.qtd}</td>
                          <td className="px-3 py-2">{BRL(r.receita)}</td>
                          <td className="px-3 py-2" style={{ color: "#6B7280" }}>{BRL(r.taxas + r.imposto)}</td>
                          <td className="px-3 py-2 font-semibold" style={{ color: r.lucro >= 0 ? "#1F2937" : "#A33B2E" }}>{BRL(r.lucro)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={recebido ? { background: "#EEF2F7", color: "#374151" } : { background: "#FEF3C7", color: "#92400E" }}>
                              {recebido ? "✓ " : "→ "}{fmtData(v.recebimento)}
                            </span>
                          </td>
                          <td className="px-3 py-2"><button className="text-lg" style={{ color: "#A33B2E" }} aria-label="Excluir venda" onClick={() => excluirVenda(v)}>×</button></td>
                        </tr>
                      );
                    })}
                    {!vendas.length && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ color: "#6B7280" }}>Nenhuma venda registrada ainda. Use o formulário acima — o lucro e a data de recebimento são calculados automaticamente.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Cada venda congela o custo e as taxas do momento do registro, baixa o estoque do produto automaticamente, e projeta o recebimento pelo prazo configurado na aba Marketplaces. Excluir uma venda devolve o estoque.</p>
            </div>
          );
        })()}

        {tab === "tempo-real" && (
          <VendasTiny produtos={produtos} insumos={insumos} marketplaces={marketplaces} />
        )}

        {tab === "rh" && <RH fabricas={fabricas} setFab={setFab} />}

        {tab === "relatorios" && <Relatorios produtos={produtos} insumos={insumos} fornecedores={fornecedores} />}

        {tab === "usuarios" && <Usuarios />}

        {tab === "clientes" && <Clientes />}

        {/* ============ FINANCEIRO ============ */}
        {tab === "financeiro" && (() => {
          const hoje = hojeISO();
          const mes = hoje.slice(0, 7);
          const soma = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
          const entradasMes = soma(financeiro.filter((l) => l.tipo === "entrada" && (l.data || "").slice(0, 7) === mes), (l) => num(l.valor));
          const saidasMes = soma(financeiro.filter((l) => l.tipo === "saida" && (l.data || "").slice(0, 7) === mes), (l) => num(l.valor));
          const recebidoVendasMes = soma(vendas.filter((v) => v.recebimento <= hoje && (v.recebimento || "").slice(0, 7) === mes), (v) => lucroVenda(v).liquido);
          const aReceber = soma(vendas.filter((v) => v.recebimento > hoje), (v) => lucroVenda(v).liquido);
          const saldoGeral = soma(financeiro.filter((l) => l.tipo === "entrada"), (l) => num(l.valor))
            - soma(financeiro.filter((l) => l.tipo === "saida"), (l) => num(l.valor))
            + soma(vendas.filter((v) => v.recebimento <= hoje), (v) => lucroVenda(v).liquido);
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[["Entradas do mês (manuais)", entradasMes, "#1F2937"], ["Vendas recebidas no mês", recebidoVendasMes, "#1F2937"], ["Saídas do mês", saidasMes, "#A33B2E"], ["A receber de vendas", aReceber, "#92400E"]].map(([l, v, c]) => (
                  <div key={l} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
                    <p className="text-xs" style={{ color: "#6B7280" }}>{l}</p>
                    <p className="text-xl font-bold" style={{ color: c }}>{BRL(v)}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4 shadow-sm" style={{ background: "#1F2937" }}>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>Saldo geral (entradas manuais + vendas recebidas − saídas)</p>
                <p className="text-2xl font-bold" style={{ color: "#F0C05A" }}>{BRL(saldoGeral)}</p>
              </div>

              <LancamentoForm onSave={addLancamento} />

              <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto" style={{ borderColor: "#E5E7EB" }}>
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr style={{ background: "#EEF2F7", color: "#374151" }}>
                      {["Data", "Descrição", "Categoria", "Tipo", "Valor", ""].map((h) => (
                        <th key={h} className="text-left px-3 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {financeiro.slice(0, 100).map((l) => (
                      <tr key={l.id} className="border-t" style={{ borderColor: "#EFE9DC" }}>
                        <td className="px-3 py-2 whitespace-nowrap">{fmtData(l.data)}</td>
                        <td className="px-3 py-2">{l.descricao}</td>
                        <td className="px-3 py-2" style={{ color: "#6B7280" }}>{l.categoria || "—"}</td>
                        <td className="px-3 py-2">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={l.tipo === "entrada" ? { background: "#EEF2F7", color: "#374151" } : { background: "#FBE7E3", color: "#A33B2E" }}>
                            {l.tipo === "entrada" ? "Entrada" : "Saída"}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold" style={{ color: l.tipo === "entrada" ? "#1F2937" : "#A33B2E" }}>{l.tipo === "saida" ? "− " : "+ "}{BRL(num(l.valor))}</td>
                        <td className="px-3 py-2"><button className="text-lg" style={{ color: "#A33B2E" }} aria-label="Excluir lançamento" onClick={() => delLancamento(l.id)}>×</button></td>
                      </tr>
                    ))}
                    {!financeiro.length && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#6B7280" }}>Nenhum lançamento. Registre entradas e saídas acima — as vendas dos marketplaces entram automaticamente quando o recebimento vence.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* ============ ESTOQUE ============ */}
        {tab === "estoque" && (() => {
          const filtro = (txt) => txt.toLowerCase().includes(busca.toLowerCase());
          const prodsF = produtos.filter((p) => filtro((p.sku || "") + " " + p.nome));
          const insF = insumos.filter((i) => filtro(i.codigo + " " + i.descricao));
          const baixoProd = produtos.filter((p) => num(p.estoque) <= num(p.estoqueMin) && num(p.estoqueMin) > 0).length;
          const baixoIns = insumos.filter((i) => num(i.estoque) <= num(i.estoqueMin) && num(i.estoqueMin) > 0).length;
          const badge = (qtd, min) => num(min) > 0 && num(qtd) <= num(min)
            ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FBE7E3", color: "#A33B2E" }}>Baixo</span>
            : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#EEF2F7", color: "#374151" }}>OK</span>;
          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <input className={inputCls + " max-w-xs"} style={inputStyle} placeholder="Buscar produto ou insumo…" value={busca} onChange={(e) => setBusca(e.target.value)} />
                <p className="text-sm" style={{ color: (baixoProd + baixoIns) ? "#A33B2E" : "#6B7280" }}>
                  {(baixoProd + baixoIns) ? `⚠ ${baixoProd + baixoIns} item(ns) abaixo do mínimo` : "Todos os itens acima do mínimo"}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto" style={{ borderColor: "#E5E7EB" }}>
                <p className="px-4 pt-4 font-semibold">Produtos prontos <span className="text-xs font-normal" style={{ color: "#9CA3AF" }}>— vendas registradas baixam o estoque automaticamente</span></p>
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr style={{ color: "#6B7280" }}>
                      {["SKU", "Produto", "Em estoque", "Mínimo", "Status"].map((h) => <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {prodsF.slice(0, busca ? 200 : 30).map((p) => (
                      <tr key={p.id} className="border-t" style={{ borderColor: "#EFE9DC" }}>
                        <td className="px-4 py-2 font-mono text-xs font-semibold">{p.sku}</td>
                        <td className="px-4 py-2">{p.nome}</td>
                        <td className="px-4 py-2"><input type="number" step="any" className={miniInput + " w-24"} style={inputStyle} value={p.estoque}
                          onChange={(e) => setProduto(p.id, { estoque: e.target.value })} /></td>
                        <td className="px-4 py-2"><input type="number" step="any" className={miniInput + " w-24"} style={inputStyle} value={p.estoqueMin}
                          onChange={(e) => setProduto(p.id, { estoqueMin: e.target.value })} /></td>
                        <td className="px-4 py-2">{badge(p.estoque, p.estoqueMin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!busca && prodsF.length > 30 && <p className="px-4 pb-3 text-xs" style={{ color: "#9CA3AF" }}>Mostrando 30 de {prodsF.length} — use a busca.</p>}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto" style={{ borderColor: "#E5E7EB" }}>
                <p className="px-4 pt-4 font-semibold">Matéria-prima e insumos</p>
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr style={{ color: "#6B7280" }}>
                      {["Código", "Insumo", "Em estoque", "Mínimo", "Status"].map((h) => <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {insF.filter((i) => !i._auto).map((i) => (
                      <tr key={i.id} className="border-t" style={{ borderColor: "#EFE9DC" }}>
                        <td className="px-4 py-2 font-mono text-xs font-semibold">{i.codigo}</td>
                        <td className="px-4 py-2">{i.descricao}</td>
                        <td className="px-4 py-2 whitespace-nowrap"><input type="number" step="any" className={miniInput + " w-24"} style={inputStyle} value={i.estoque}
                          onChange={(e) => setInsumoCampo(i.id, { estoque: e.target.value })} /> <span className="text-xs" style={{ color: "#9CA3AF" }}>{i.unidUso}</span></td>
                        <td className="px-4 py-2"><input type="number" step="any" className={miniInput + " w-24"} style={inputStyle} value={i.estoqueMin}
                          onChange={(e) => setInsumoCampo(i.id, { estoqueMin: e.target.value })} /></td>
                        <td className="px-4 py-2">{badge(i.estoque, i.estoqueMin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* ============ INSUMOS ============ */}
        {tab === "insumos" && (
          <>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <p className="text-sm" style={{ color: "#6B7280" }}>Preço mudou no fornecedor? Atualize aqui e <strong>todos os produtos recalculam sozinhos</strong>.</p>
              <button onClick={() => setEditInsumo("novo")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: "#2563EB" }}>
                + Novo insumo
              </button>
            </div>
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <input className={inputCls + " max-w-xs"} style={inputStyle} placeholder="Buscar por código ou descrição…"
                value={busca} onChange={(e) => setBusca(e.target.value)} />
              <span className="text-xs" style={{ color: "#9CA3AF" }}>
                {insumos.filter((i) => (i.codigo + " " + i.descricao).toLowerCase().includes(busca.toLowerCase())).length} de {insumos.length} insumos
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto" style={{ borderColor: "#E5E7EB" }}>
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr style={{ background: "#EEF2F7", color: "#374151" }}>
                    {["Código", "Descrição", "Fornecedor", "Compra", "Preço", "Rende", "Custo por unid. de uso", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {insumos.filter((i) => (i.codigo + " " + i.descricao + " " + nomeFornecedor(i.fornecedorId)).toLowerCase().includes(busca.toLowerCase())).map((i) => (
                    <tr key={i.id} className="border-t" style={{ borderColor: "#EFE9DC" }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{i.codigo}</td>
                      <td className="px-4 py-3">{i.descricao}<span className="block text-xs" style={{ color: "#9CA3AF" }}>{i.categoria}{i._auto ? " · calculado na aba Fábricas" : ""}</span></td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>{nomeFornecedor(i.fornecedorId) || "—"}</td>
                      <td className="px-4 py-3" style={{ color: "#6B7280" }}>1 {i.unidCompra}</td>
                      <td className="px-4 py-3">{BRL(num(i.preco))}</td>
                      <td className="px-4 py-3" style={{ color: "#6B7280" }}>{i.rendimento} {i.unidUso}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#1F2937" }}>{BRL4(custoUnit(i))} / {i.unidUso}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => setEditInsumo(i)} className="text-sm font-medium mr-3" style={{ color: "#1F2937" }}>Editar</button>
                        <button onClick={() => excluirInsumo(i.id)} className="text-sm" style={{ color: "#A33B2E" }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ FORNECEDORES ============ */}
        {tab === "fornecedores" && (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-sm" style={{ color: "#6B7280" }}>Cadastre seus fornecedores aqui. Cada insumo pode ser vinculado a um deles na tela de edição.</p>
              <button onClick={() => setEditForn("novo")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: "#2563EB" }}>
                + Novo fornecedor
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fornecedores.map((f) => {
                const qtd = insumos.filter((i) => i.fornecedorId === f.id).length;
                return (
                  <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{f.nome}</p>
                        {f.contato && <p className="text-sm" style={{ color: "#6B7280" }}>{f.contato}</p>}
                        {f.obs && <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{f.obs}</p>}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap" style={{ background: "#EEF2F7", color: "#374151" }}>{qtd} insumo{qtd === 1 ? "" : "s"}</span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => setEditForn(f)} className="text-sm font-medium" style={{ color: "#1F2937" }}>Editar</button>
                      <button onClick={() => excluirFornecedor(f)} className="text-sm" style={{ color: "#A33B2E" }}>Excluir</button>
                    </div>
                  </div>
                );
              })}
              {!fornecedores.length && (
                <div className="sm:col-span-2 bg-white rounded-2xl p-8 text-center border" style={{ borderColor: "#E5E7EB", color: "#6B7280" }}>
                  Nenhum fornecedor cadastrado. Toque em "+ Novo fornecedor".
                </div>
              )}
            </div>
          </>
        )}

        {/* ============ FÁBRICAS ============ */}
        {tab === "fabricas" && (
          <div className="space-y-5">
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
              Aqui você calcula o <strong>custo por minuto de cada máquina</strong> e o custo de montagem. Esses valores alimentam automaticamente os insumos de produção (CORTELASER, CORTEROUTER, MONTCILINDRO) — então, ao ajustar qualquer coisa aqui, todos os produtos que usam corte/montagem recalculam sozinhos.
            </div>

            {fabricas.map((fab) => {
              const cMin = custoMaquinaMinuto(fab);
              const cHora = cMin * 60;
              const totColab = totalColaboradores(fab.colaboradores);
              const cMont = custoMontagem(fab);
              return (
                <div key={fab.id} className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
                  <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2" style={{ borderColor: "#E5E7EB" }}>
                    <div>
                      <h3 className="font-semibold text-lg">{fab.nome}</h3>
                      <p className="text-xs" style={{ color: "#9CA3AF" }}>{(fab.colaboradores || []).length} colaboradores · {fab.maquinas} máquina(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "#6B7280" }}>Custo da máquina</p>
                      <p className="text-lg font-bold" style={{ color: "#2563EB" }}>{BRL4(cMin)}/min <span className="text-sm font-normal" style={{ color: "#9CA3AF" }}>· {BRL(cHora)}/h</span></p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* parâmetros base */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[["custosFixos", "Custos fixos (R$/mês)"], ["diasMes", "Dias/mês"], ["horasDia", "Horas/dia"], ["maquinas", "Nº de máquinas"]].map(([k, l]) => (
                        <Field key={k} label={l}>
                          <input type="number" step="any" className={inputCls} style={inputStyle} value={fab[k]}
                            onChange={(e) => setFab(fab.id, { [k]: e.target.value })} />
                        </Field>
                      ))}
                    </div>

                    {/* detalhamento dos custos fixos */}
                    {fab.fixosDetalhe && (() => {
                      const somaFixos = (fab.fixosDetalhe || []).reduce((s, x) => s + (x.auto === "colaboradores" ? totColab : num(x.valor)), 0);
                      const bate = Math.abs(somaFixos - num(fab.custosFixos)) < 0.5;
                      return (
                        <details className="rounded-xl" style={{ background: "#F8FAFC" }}>
                          <summary className="px-4 py-3 cursor-pointer text-sm font-semibold" style={{ color: "#374151" }}>
                            Detalhamento dos custos fixos — soma {BRL(somaFixos)} {bate ? "✓" : "(≠ do valor acima)"}
                          </summary>
                          <div className="px-4 pb-4 space-y-2">
                            {(fab.fixosDetalhe || []).map((x) => (
                              <div key={x.id} className="flex items-center gap-2">
                                <input className={inputCls + " flex-1"} style={inputStyle} value={x.nome}
                                  onChange={(e) => setFab(fab.id, { fixosDetalhe: fab.fixosDetalhe.map((y) => y.id === x.id ? { ...y, nome: e.target.value } : y) })} />
                                {x.auto === "colaboradores" ? (
                                  <span className="w-32 text-right text-sm px-3 py-2 rounded-lg" style={{ background: "#EEF2F7", color: "#374151" }} title="Vem da tabela de colaboradores">
                                    {BRL(totColab)} 🔗
                                  </span>
                                ) : (
                                  <input type="number" step="any" className={inputCls + " w-32 text-right"} style={inputStyle} value={x.valor}
                                    onChange={(e) => setFab(fab.id, { fixosDetalhe: fab.fixosDetalhe.map((y) => y.id === x.id ? { ...y, valor: e.target.value } : y) })} />
                                )}
                                <button className="text-lg px-1" style={{ color: "#A33B2E" }}
                                  onClick={() => setFab(fab.id, { fixosDetalhe: fab.fixosDetalhe.filter((y) => y.id !== x.id) })}>×</button>
                              </div>
                            ))}
                            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                              <button className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#1F2937", background: "#EEF2F7" }}
                                onClick={() => setFab(fab.id, { fixosDetalhe: [...(fab.fixosDetalhe || []), { id: uid(), nome: "Novo custo fixo", valor: 0 }] })}>
                                + Adicionar custo fixo
                              </button>
                              {!bate && (
                                <button className="text-sm font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: "#2563EB" }}
                                  onClick={() => setFab(fab.id, { custosFixos: somaFixos })}>
                                  Usar {BRL(somaFixos)} como custo fixo
                                </button>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>A linha "Total Colaboradores" 🔗 é somada automaticamente da tabela de colaboradores abaixo. O total detalhado pode ser diferente do campo "Custos fixos" acima se você usa um valor ajustado (ex.: ROUTER exclui a equipe de montagem, cobrada à parte).</p>
                          </div>
                        </details>
                      );
                    })()}

                    {/* extras */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Custos adicionais</p>
                      <div className="space-y-2">
                        {(fab.extras || []).map((e) => (
                          <div key={e.id} className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#F8FAFC" }}>
                            <input className={inputCls + " flex-1 min-w-[140px]"} style={inputStyle} value={e.nome}
                              onChange={(ev) => setFab(fab.id, { extras: fab.extras.map((x) => x.id === e.id ? { ...x, nome: ev.target.value } : x) })} />
                            <select className={inputCls + " w-32"} style={inputStyle} value={e.tipo}
                              onChange={(ev) => setFab(fab.id, { extras: fab.extras.map((x) => x.id === e.id ? { ...x, tipo: ev.target.value } : x) })}>
                              <option value="horas">R$ por hora</option>
                              <option value="mensal">R$ por mês</option>
                              <option value="minuto">R$ por minuto</option>
                            </select>
                            <input type="number" step="any" className={inputCls + " w-28 text-right"} style={inputStyle}
                              value={e.tipo === "horas" ? e.valorHora : e.tipo === "mensal" ? e.valorMes : e.valorMin}
                              onChange={(ev) => {
                                const campo = e.tipo === "horas" ? "valorHora" : e.tipo === "mensal" ? "valorMes" : "valorMin";
                                setFab(fab.id, { extras: fab.extras.map((x) => x.id === e.id ? { ...x, [campo]: ev.target.value } : x) });
                              }} />
                            <button className="text-lg px-1" style={{ color: "#A33B2E" }} aria-label="Remover"
                              onClick={() => setFab(fab.id, { extras: fab.extras.filter((x) => x.id !== e.id) })}>×</button>
                          </div>
                        ))}
                      </div>
                      <button className="mt-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#1F2937", background: "#EEF2F7" }}
                        onClick={() => setFab(fab.id, { extras: [...(fab.extras || []), { id: uid(), nome: "Novo custo", tipo: "horas", valorHora: 0 }] })}>
                        + Adicionar custo
                      </button>
                    </div>

                    {/* memória de cálculo */}
                    <div className="rounded-xl p-4 text-sm" style={{ background: "#1F2937", color: "#D8CFBC" }}>
                      <p className="font-semibold text-white mb-2">Como o custo/minuto é calculado</p>
                      <p>Custos fixos ÷ {fab.diasMes} dias ÷ {fab.horasDia}h ÷ 60 = {BRL4(num(fab.custosFixos) / (num(fab.diasMes) || 22) / (num(fab.horasDia) || 1) / 60)}/min</p>
                      {(fab.extras || []).map((e) => (
                        <p key={e.id}>+ {e.nome}: {BRL4(e.tipo === "horas" ? num(e.valorHora) / 60 : e.tipo === "mensal" ? num(e.valorMes) / (num(fab.diasMes) || 22) / (num(fab.horasDia) || 1) / 60 : num(e.valorMin))}/min</p>
                      ))}
                      <p className="mt-1">= {BRL4(cMin * num(fab.maquinas))}/min por máquina ÷ {fab.maquinas} máquinas</p>
                      <p className="font-bold text-white mt-1">= {BRL4(cMin)}/min (alimenta o insumo {fab.insumoCorte})</p>
                    </div>

                    {/* colaboradores */}
                    <details className="rounded-xl" style={{ background: "#F8FAFC" }}>
                      <summary className="px-4 py-3 cursor-pointer text-sm font-semibold" style={{ color: "#374151" }}>
                        Colaboradores da fábrica — total {BRL(totColab)}/mês ({(fab.colaboradores || []).length})
                      </summary>
                      <div className="px-4 pb-4 overflow-x-auto">
                        <table className="w-full text-sm min-w-[520px]">
                          <thead>
                            <tr style={{ color: "#6B7280" }}>
                              {["Nome", "Cargo", "Salário", "Encargos", "Bônus", "Total", ""].map((h) => (
                                <th key={h} className="text-left px-2 py-2 font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(fab.colaboradores || []).map((c) => (
                              <tr key={c.id} className="border-t" style={{ borderColor: "#E5E7EB" }}>
                                <td className="px-2 py-1"><input className={miniInput + " text-left"} style={inputStyle} value={c.nome}
                                  onChange={(e) => setFab(fab.id, { colaboradores: fab.colaboradores.map((x) => x.id === c.id ? { ...x, nome: e.target.value } : x) })} /></td>
                                <td className="px-2 py-1"><input className={miniInput + " text-left"} style={inputStyle} value={c.cargo}
                                  onChange={(e) => setFab(fab.id, { colaboradores: fab.colaboradores.map((x) => x.id === c.id ? { ...x, cargo: e.target.value } : x) })} /></td>
                                {["salario", "encargos", "bonus", "total"].map((campo) => (
                                  <td key={campo} className="px-2 py-1"><input type="number" step="any" className={miniInput} style={inputStyle} value={c[campo]}
                                    onChange={(e) => setFab(fab.id, { colaboradores: fab.colaboradores.map((x) => x.id === c.id ? { ...x, [campo]: e.target.value } : x) })} /></td>
                                ))}
                                <td className="px-2 py-1"><button className="text-lg" style={{ color: "#A33B2E" }} aria-label="Remover"
                                  onClick={() => setFab(fab.id, { colaboradores: fab.colaboradores.filter((x) => x.id !== c.id) })}>×</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <button className="mt-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#1F2937", background: "#EEF2F7" }}
                          onClick={() => setFab(fab.id, { colaboradores: [...(fab.colaboradores || []), { id: uid(), nome: "Novo colaborador", cargo: "", salario: 0, encargos: 0, bonus: 0, total: 0 }] })}>
                          + Adicionar colaborador
                        </button>
                      </div>
                    </details>

                    {/* montagem opcional */}
                    {fab.montagem && (
                      <div className="rounded-xl p-4" style={{ background: "#EEF2F7" }}>
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <p className="text-sm font-semibold" style={{ color: "#374151" }}>{fab.montagem.nome}</p>
                          <p className="text-sm">Custo: <strong style={{ color: "#2563EB" }}>{BRL4(cMont)}</strong> / un (insumo {fab.montagem.insumoCodigo})</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                          <label className="flex items-center gap-2" style={{ color: "#6B7280" }}>
                            Média produzida por dia
                            <input type="number" step="any" className={inputCls + " w-24 text-right"} style={inputStyle} value={fab.montagem.mediaDia}
                              onChange={(e) => setFab(fab.id, { montagem: { ...fab.montagem, mediaDia: e.target.value } })} />
                          </label>
                          <span style={{ color: "#6B7280" }}>
                            Total equipe {BRL(totalColaboradores(fab.montagem.colaboradores))}/mês ÷ ({fab.montagem.mediaDia} × {fab.diasMes} dias)
                          </span>
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs font-semibold" style={{ color: "#1F2937" }}>Ver equipe de montagem ({(fab.montagem.colaboradores || []).length})</summary>
                          <div className="mt-2 overflow-x-auto">
                            <table className="w-full text-sm min-w-[520px]">
                              <thead><tr style={{ color: "#6B7280" }}>{["Nome", "Cargo", "Total", ""].map((h) => <th key={h} className="text-left px-2 py-1 font-medium">{h}</th>)}</tr></thead>
                              <tbody>
                                {(fab.montagem.colaboradores || []).map((c) => (
                                  <tr key={c.id} className="border-t" style={{ borderColor: "#DED5C0" }}>
                                    <td className="px-2 py-1"><input className={miniInput + " text-left"} style={inputStyle} value={c.nome}
                                      onChange={(e) => setFab(fab.id, { montagem: { ...fab.montagem, colaboradores: fab.montagem.colaboradores.map((x) => x.id === c.id ? { ...x, nome: e.target.value } : x) } })} /></td>
                                    <td className="px-2 py-1"><input className={miniInput + " text-left"} style={inputStyle} value={c.cargo}
                                      onChange={(e) => setFab(fab.id, { montagem: { ...fab.montagem, colaboradores: fab.montagem.colaboradores.map((x) => x.id === c.id ? { ...x, cargo: e.target.value } : x) } })} /></td>
                                    <td className="px-2 py-1"><input type="number" step="any" className={miniInput} style={inputStyle} value={c.total}
                                      onChange={(e) => setFab(fab.id, { montagem: { ...fab.montagem, colaboradores: fab.montagem.colaboradores.map((x) => x.id === c.id ? { ...x, total: e.target.value } : x) } })} /></td>
                                    <td className="px-2 py-1"><button className="text-lg" style={{ color: "#A33B2E" }}
                                      onClick={() => setFab(fab.id, { montagem: { ...fab.montagem, colaboradores: fab.montagem.colaboradores.filter((x) => x.id !== c.id) } })}>×</button></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button className="mt-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#1F2937", background: "#fff" }}
                              onClick={() => setFab(fab.id, { montagem: { ...fab.montagem, colaboradores: [...(fab.montagem.colaboradores || []), { id: uid(), nome: "Novo", cargo: "", salario: 0, encargos: 0, bonus: 0, total: 0 }] } })}>
                              + Adicionar à equipe
                            </button>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============ MARKETPLACES ============ */}
        {tab === "marketplaces" && (
          <div className="space-y-4">
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
              As taxas abaixo vieram das políticas públicas dos marketplaces (jul/2026). <strong>Confira com a sua "Tabela de apoio"</strong> de cada canal e ajuste — principalmente a tabela de frete por peso do Mercado Livre, que varia por reputação e categoria.
            </div>
            {marketplaces.map((m) => {
              const aberto = mktAberto === m.id;
              const faixas = [...(m.faixas || [])].sort((a, b) => (a.ate == null ? 1 : b.ate == null ? -1 : num(a.ate) - num(b.ate)));
              return (
                <div key={m.id} className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
                  <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setMktAberto(aberto ? null : m.id)}>
                    <div>
                      <p className="font-semibold">{m.nome}</p>
                      <p className="text-xs" style={{ color: "#9CA3AF" }}>
                        {faixas.map((f) => {
                          let txt = f.pct + "%";
                          if (num(f.fixo)) txt += " + " + BRL(num(f.fixo));
                          if (f.ate != null) txt += " até " + BRL(num(f.ate));
                          else if (faixas.length > 1) txt += " acima";
                          return txt;
                        }).join("  ·  ")}
                        {m.frete?.length ? "  ·  frete por peso (" + m.frete.length + " faixas)" : ""}
                      </p>
                    </div>
                    <span className="text-xl" style={{ color: "#9CA3AF" }}>{aberto ? "−" : "+"}</span>
                  </button>
                  {aberto && (
                    <div className="px-5 pb-5 space-y-4">
                      {m.nota && <p className="text-xs rounded-lg px-3 py-2" style={{ background: "#F8FAFC", color: "#6B7280" }}>{m.nota}</p>}

                      <div className="flex flex-wrap gap-4">
                        <div className="max-w-xs">
                          <label className="text-xs" style={{ color: "#6B7280" }}>Taxa extra sobre a venda (ex.: afiliados) — %
                            <input className={miniInput} style={inputStyle} value={m.extraPct ?? 0}
                              onChange={(e) => setMkt(m.id, { extraPct: e.target.value })} />
                          </label>
                          <p className="text-[11px] mt-1" style={{ color: "#9CA3AF" }}>Entra no preço final de todas as faixas. Deixe 0 se não usar.</p>
                        </div>
                        <div className="max-w-xs">
                          <label className="text-xs" style={{ color: "#6B7280" }}>Prazo de recebimento (dias após a venda)
                            <input className={miniInput} style={inputStyle} value={m.prazoDias ?? 14}
                              onChange={(e) => setMkt(m.id, { prazoDias: e.target.value })} />
                          </label>
                          <p className="text-[11px] mt-1" style={{ color: "#9CA3AF" }}>Usado na aba Vendas para projetar quando o dinheiro cai.</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Comissão por faixa de preço</p>
                        <div className="space-y-2">
                          {faixas.map((f) => (
                            <div key={f.id} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-center">
                              <label className="text-xs" style={{ color: "#6B7280" }}>Preço até (R$)
                                <input className={miniInput} style={inputStyle} value={f.ate ?? ""} placeholder="acima (vazio)"
                                  onChange={(e) => setMkt(m.id, { faixas: m.faixas.map((x) => x.id === f.id ? { ...x, ate: e.target.value === "" ? null : e.target.value } : x) })} />
                              </label>
                              <label className="text-xs" style={{ color: "#6B7280" }}>Comissão (%)
                                <input className={miniInput} style={inputStyle} value={f.pct}
                                  onChange={(e) => setMkt(m.id, { faixas: m.faixas.map((x) => x.id === f.id ? { ...x, pct: e.target.value } : x) })} />
                              </label>
                              <label className="text-xs" style={{ color: "#6B7280" }}>Taxa fixa (R$/item)
                                <input className={miniInput} style={inputStyle} value={f.fixo}
                                  onChange={(e) => setMkt(m.id, { faixas: m.faixas.map((x) => x.id === f.id ? { ...x, fixo: e.target.value } : x) })} />
                              </label>
                              <label className="text-xs flex flex-col items-center" style={{ color: "#6B7280" }}>Frete?
                                <input type="checkbox" className="mt-2 w-4 h-4" checked={f.frete !== false}
                                  onChange={(e) => setMkt(m.id, { faixas: m.faixas.map((x) => x.id === f.id ? { ...x, frete: e.target.checked } : x) })} />
                              </label>
                              <button className="text-lg mt-4 px-1" style={{ color: "#A33B2E" }} aria-label="Remover faixa"
                                onClick={() => setMkt(m.id, { faixas: m.faixas.filter((x) => x.id !== f.id) })}>×</button>
                            </div>
                          ))}
                        </div>
                        <button className="mt-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#1F2937", background: "#EEF2F7" }}
                          onClick={() => setMkt(m.id, { faixas: [...(m.faixas || []), { id: uid(), ate: null, pct: 0, fixo: 0, frete: false }] })}>
                          + Adicionar faixa
                        </button>
                        <p className="text-[11px] mt-1" style={{ color: "#9CA3AF" }}>A coluna "Frete?" define se aquela faixa cobra o frete da tabela abaixo (ex.: Mercado Livre só cobra frete acima de R$78,90).</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-1">Frete por peso considerado</p>
                        <p className="text-xs mb-2" style={{ color: "#9CA3AF" }}>Cobrado do vendedor conforme o maior peso (bruto ou cúbico). Deixe vazio se o canal não cobra frete de você.</p>
                        <div className="space-y-2 max-w-md">
                          {[...(m.frete || [])].sort((a, b) => (a.ate == null ? 1 : b.ate == null ? -1 : num(a.ate) - num(b.ate))).map((f) => (
                            <div key={f.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                              <label className="text-xs" style={{ color: "#6B7280" }}>Peso até (kg)
                                <input className={miniInput} style={inputStyle} value={f.ate ?? ""} placeholder="acima (vazio)"
                                  onChange={(e) => setMkt(m.id, { frete: m.frete.map((x) => x.id === f.id ? { ...x, ate: e.target.value === "" ? null : e.target.value } : x) })} />
                              </label>
                              <label className="text-xs" style={{ color: "#6B7280" }}>Valor (R$)
                                <input className={miniInput} style={inputStyle} value={f.valor}
                                  onChange={(e) => setMkt(m.id, { frete: m.frete.map((x) => x.id === f.id ? { ...x, valor: e.target.value } : x) })} />
                              </label>
                              <button className="text-lg mt-4 px-1" style={{ color: "#A33B2E" }} aria-label="Remover faixa de frete"
                                onClick={() => setMkt(m.id, { frete: m.frete.filter((x) => x.id !== f.id) })}>×</button>
                            </div>
                          ))}
                        </div>
                        <button className="mt-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#1F2937", background: "#EEF2F7" }}
                          onClick={() => setMkt(m.id, { frete: [...(m.frete || []), { id: uid(), ate: null, valor: 0 }] })}>
                          + Adicionar faixa de frete
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <ConfirmButton label={`Excluir ${m.nome}`} confirmLabel="Toque de novo para excluir"
                          onConfirm={() => setData((d) => ({ ...d, marketplaces: d.marketplaces.filter((x) => x.id !== m.id) }))}
                          className="text-xs px-3 py-2 rounded-lg border" style={{ color: "#A33B2E", borderColor: "#E5C7C1" }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={() => { const id = uid(); setData((d) => ({ ...d, marketplaces: [...d.marketplaces, { id, nome: "Novo canal", faixas: [{ id: uid(), ate: null, pct: 0, fixo: 0 }], frete: [] }] })); setMktAberto(id); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: "#2563EB" }}>
              + Adicionar marketplace
            </button>
            {mktAberto && marketplaces.some((m) => m.id === mktAberto) && (
              <div className="max-w-sm">
                <Field label="Nome do canal aberto">
                  <input className={inputCls} style={inputStyle} value={marketplaces.find((m) => m.id === mktAberto)?.nome ?? ""}
                    onChange={(e) => setMkt(mktAberto, { nome: e.target.value })} />
                </Field>
              </div>
            )}
          </div>
        )}

        {/* ============ AJUDA ============ */}
        {tab === "ajuda" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border max-w-2xl space-y-4 text-sm leading-relaxed" style={{ borderColor: "#E5E7EB" }}>
            <h3 className="font-semibold text-base">Como usar</h3>
            <p><strong>1 · Fábricas.</strong> Cadastre os custos fixos, máquinas e colaboradores de cada fábrica (LASER e ROUTER). O sistema calcula o custo por minuto de cada máquina e o custo de montagem, que alimentam automaticamente os insumos de corte e montagem.</p>
            <p><strong>2 · Insumos.</strong> Matéria-prima, embalagem e serviços com preço de compra e rendimento. Os itens de produção (CORTELASER, CORTEROUTER, MONTCILINDRO) são preenchidos pela aba Fábricas.</p>
            <p><strong>3 · Produtos.</strong> Monte a ficha técnica (quais insumos e quantidades, incluindo os minutos de corte). O custo de produção soma tudo automaticamente.</p>
            <p><strong>4 · Pacote embalado.</strong> Peso bruto e medidas. O sistema calcula o peso cúbico (C×L×A÷6000) e usa o maior dos dois para o frete.</p>
            <p><strong>5 · Preço por canal.</strong> Margem e imposto do produto → preço de venda para Shopee, Mercado Livre (Clássico e Premium), SHEIN, TikTok, Kwai e venda direta.</p>
            <p style={{ color: "#6B7280" }}>Tudo é interligado: mudou o salário de um colaborador ou o preço de uma chapa, todos os produtos afetados recalculam sozinhos. Seus dados ficam salvos automaticamente.</p>
            <ConfirmButton label="Restaurar dados de exemplo (apaga tudo)" confirmLabel="Toque de novo para apagar tudo"
              onConfirm={() => setData(SEED)}
              className="text-xs px-3 py-2 rounded-lg border" style={{ color: "#A33B2E", borderColor: "#E5C7C1" }} />
          </div>
        )}
      </main>

      {editInsumo && (
        <InsumoForm insumo={editInsumo === "novo" ? null : editInsumo} fornecedores={fornecedores} onSave={salvarInsumo} onClose={() => setEditInsumo(null)} />
      )}
      {editForn && (
        <FornecedorForm fornecedor={editForn === "novo" ? null : editForn} onSave={salvarFornecedor} onClose={() => setEditForn(null)} />
      )}
    </div>
  );
}

function InsumoForm({ insumo, fornecedores, onSave, onClose }) {
  const [f, setF] = useState(
    insumo ?? { id: uid(), codigo: "", descricao: "", categoria: "Matéria-prima", unidCompra: "un", preco: "", rendimento: 1, unidUso: "un", fornecedorId: "" }
  );
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const cu = num(f.rendimento) > 0 ? num(f.preco) / num(f.rendimento) : 0;
  const ok = f.codigo.trim() && f.descricao.trim() && num(f.preco) > 0 && num(f.rendimento) > 0;
  return (
    <Modal title={insumo ? "Editar insumo" : "Novo insumo"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Código (curto, sem espaço)"><input className={inputCls} style={inputStyle} value={f.codigo} onChange={set("codigo")} placeholder="MDF6" /></Field>
        <Field label="Categoria">
          <select className={inputCls} style={inputStyle} value={f.categoria} onChange={set("categoria")}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <div className="col-span-2">
          <Field label="Descrição"><input className={inputCls} style={inputStyle} value={f.descricao} onChange={set("descricao")} placeholder="Chapa MDF 6mm 185x275cm" /></Field>
        </div>
        <div className="col-span-2">
          <Field label="Fornecedor">
            <select className={inputCls} style={inputStyle} value={f.fornecedorId || ""} onChange={set("fornecedorId")}>
              <option value="">— Sem fornecedor —</option>
              {(fornecedores || []).map((fo) => <option key={fo.id} value={fo.id}>{fo.nome}{fo.contato ? ` · ${fo.contato}` : ""}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Unidade de compra"><input className={inputCls} style={inputStyle} value={f.unidCompra} onChange={set("unidCompra")} placeholder="chapa, rolo, pacote, hora" /></Field>
        <Field label="Preço de compra (R$)"><input type="number" step="any" className={inputCls} style={inputStyle} value={f.preco} onChange={set("preco")} /></Field>
        <Field label="Rendimento (quanto rende)"><input type="number" step="any" className={inputCls} style={inputStyle} value={f.rendimento} onChange={set("rendimento")} /></Field>
        <Field label="Unidade de uso"><input className={inputCls} style={inputStyle} value={f.unidUso} onChange={set("unidUso")} placeholder="m², m, un, min" /></Field>
      </div>
      <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: "#EEF2F7", color: "#374151" }}>
        Custo calculado: <strong>{BRL4(cu)} por {f.unidUso || "unid."}</strong>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "#D8D0BF", color: "#374151" }}>Cancelar</button>
        <button disabled={!ok} onClick={() => onSave({ ...f, preco: num(f.preco), rendimento: num(f.rendimento) })}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: "#2563EB" }}>
          Salvar insumo
        </button>
      </div>
    </Modal>
  );
}

function FornecedorForm({ fornecedor, onSave, onClose }) {
  const [f, setF] = useState(fornecedor ?? { id: uid(), nome: "", contato: "", obs: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.nome.trim();
  return (
    <Modal title={fornecedor ? "Editar fornecedor" : "Novo fornecedor"} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome do fornecedor"><input className={inputCls} style={inputStyle} value={f.nome} onChange={set("nome")} placeholder="Ex.: Máxima embalagens" /></Field>
        <Field label="Contato (telefone, e-mail…)"><input className={inputCls} style={inputStyle} value={f.contato} onChange={set("contato")} placeholder="(19) 99836-7445" /></Field>
        <Field label="Observações (opcional)"><input className={inputCls} style={inputStyle} value={f.obs} onChange={set("obs")} placeholder="Prazo de entrega, condições, etc." /></Field>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "#D8D0BF", color: "#374151" }}>Cancelar</button>
        <button disabled={!ok} onClick={() => onSave(f)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: "#2563EB" }}>
          Salvar fornecedor
        </button>
      </div>
    </Modal>
  );
}

function VendaForm({ produtos, marketplaces, insumos, onSave }) {
  const [f, setF] = useState({ data: hojeISO(), produtoId: "", canalId: "", qtd: 1, precoUnit: "" });
  const prodSel = produtos.find((p) => p.id === f.produtoId);
  const mp = marketplaces.find((m) => m.id === f.canalId);
  let sugestao = NaN;
  if (prodSel) {
    const custo = custoProduto(prodSel, insumos);
    if (f.canalId === "direta") {
      const div = 1 - (num(prodSel.margem) + num(prodSel.imposto)) / 100;
      sugestao = div > 0 ? custo / div : NaN;
    } else if (mp) {
      sugestao = calcMarketplace(mp, custo, num(prodSel.margem), num(prodSel.imposto), pesoConsiderado(prodSel)).preco;
    }
  }
  const precoFinal = f.precoUnit === "" ? sugestao : num(f.precoUnit);
  const ok = prodSel && f.canalId && num(f.qtd) > 0 && isFinite(precoFinal) && precoFinal > 0;

  const salvar = () => {
    const custoUnit = custoProduto(prodSel, insumos);
    const taxasUnit = f.canalId === "direta" ? 0 : taxasDoPreco(mp, precoFinal, pesoConsiderado(prodSel));
    const prazo = f.canalId === "direta" ? 0 : num(mp?.prazoDias ?? 14);
    onSave({
      id: uid(), data: f.data, produtoId: prodSel.id, sku: prodSel.sku || "", nomeProduto: prodSel.nome,
      canalId: f.canalId, canalNome: f.canalId === "direta" ? "Venda direta" : (mp?.nome || ""),
      qtd: num(f.qtd), precoUnit: precoFinal, custoUnit, taxasUnit, impostoPct: num(prodSel.imposto),
      recebimento: addDias(f.data, prazo),
    });
    setF({ data: f.data, produtoId: "", canalId: f.canalId, qtd: 1, precoUnit: "" });
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
      <h3 className="font-semibold mb-3">Registrar venda</h3>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
        <Field label="Data"><input type="date" className={inputCls} style={inputStyle} value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></Field>
        <div className="col-span-2">
          <Field label="Produto">
            <select className={inputCls} style={inputStyle} value={f.produtoId} onChange={(e) => setF({ ...f, produtoId: e.target.value, precoUnit: "" })}>
              <option value="">— Escolha —</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.sku ? p.sku + " — " : ""}{p.nome}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Canal">
          <select className={inputCls} style={inputStyle} value={f.canalId} onChange={(e) => setF({ ...f, canalId: e.target.value, precoUnit: "" })}>
            <option value="">— Escolha —</option>
            {marketplaces.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            <option value="direta">Venda direta</option>
          </select>
        </Field>
        <Field label="Qtd"><input type="number" step="any" className={inputCls} style={inputStyle} value={f.qtd} onChange={(e) => setF({ ...f, qtd: e.target.value })} /></Field>
        <Field label="Preço unit. (R$)">
          <input type="number" step="any" className={inputCls} style={inputStyle} value={f.precoUnit}
            placeholder={isFinite(sugestao) ? sugestao.toFixed(2) : ""} onChange={(e) => setF({ ...f, precoUnit: e.target.value })} />
        </Field>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          {isFinite(sugestao) ? `Preço sugerido pela precificação: ${BRL(sugestao)} — deixe em branco para usar, ou digite o preço real da venda.` : "Escolha produto e canal para ver o preço sugerido."}
        </p>
        <button disabled={!ok} onClick={salvar}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: "#2563EB" }}>
          Registrar venda
        </button>
      </div>
    </div>
  );
}

function LancamentoForm({ onSave }) {
  const [f, setF] = useState({ data: hojeISO(), descricao: "", categoria: "", tipo: "saida", valor: "" });
  const ok = f.descricao.trim() && num(f.valor) > 0;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
      <h3 className="font-semibold mb-3">Novo lançamento</h3>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
        <Field label="Data"><input type="date" className={inputCls} style={inputStyle} value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></Field>
        <div className="col-span-2">
          <Field label="Descrição"><input className={inputCls} style={inputStyle} value={f.descricao} placeholder="Ex.: Compra de MDF, conta de luz…" onChange={(e) => setF({ ...f, descricao: e.target.value })} /></Field>
        </div>
        <Field label="Categoria"><input className={inputCls} style={inputStyle} value={f.categoria} placeholder="opcional" onChange={(e) => setF({ ...f, categoria: e.target.value })} /></Field>
        <Field label="Tipo">
          <select className={inputCls} style={inputStyle} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </Field>
        <Field label="Valor (R$)"><input type="number" step="any" className={inputCls} style={inputStyle} value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} /></Field>
      </div>
      <div className="flex justify-end mt-3">
        <button disabled={!ok} onClick={() => { onSave({ id: uid(), ...f, valor: num(f.valor) }); setF({ data: f.data, descricao: "", categoria: "", tipo: f.tipo, valor: "" }); }}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: "#2563EB" }}>
          Adicionar
        </button>
      </div>
    </div>
  );
}

function ImportadorShopee({ produtos, insumos, vendas, onImport, setErro }) {
  const [preview, setPreview] = useState(null);
  const [processando, setProcessando] = useState(false);

  const jaImportados = new Set(vendas.filter((v) => v.chave).map((v) => v.chave));

  const lerArquivos = async (fileList) => {
    setProcessando(true);
    try {
      const XLSX = await import("xlsx");
      let todasVendas = [];
      const semSkuTotal = {};
      let dupTotal = 0, itensTotais = 0, arquivos = 0;
      const chavesLote = new Set(jaImportados);
      for (const file of fileList) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const wb = XLSX.read(bytes, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
        const dados = linhas.slice(1); // pula cabeçalho
        const res = processarShopee(dados, produtos, insumos, chavesLote);
        // dedup também dentro do próprio lote (arquivos de contas diferentes não repetem, mas garante)
        for (const v of res.vendas) chavesLote.add(v.chave);
        todasVendas = todasVendas.concat(res.vendas);
        for (const [k, q] of Object.entries(res.semSku)) semSkuTotal[k] = (semSkuTotal[k] || 0) + q;
        dupTotal += res.dup; itensTotais += res.itensTotais; arquivos++;
      }
      setPreview({ vendas: todasVendas, semSku: semSkuTotal, dup: dupTotal, itensTotais, arquivos });
    } catch (e) {
      setErro("Não consegui ler o arquivo. Confira se é o relatório de pedidos da Shopee (.xlsx) exportado do UpSeller.");
    }
    setProcessando(false);
  };

  const confirmar = () => {
    onImport(preview.vendas);
    setPreview(null);
  };

  const resumo = preview && (() => {
    const receita = preview.vendas.reduce((s, v) => s + lucroVenda(v).receita, 0);
    const lucro = preview.vendas.reduce((s, v) => s + lucroVenda(v).lucro, 0);
    const liquido = preview.vendas.reduce((s, v) => s + lucroVenda(v).liquido, 0);
    const semSkuQtd = Object.values(preview.semSku).reduce((s, q) => s + q, 0);
    return { receita, lucro, liquido, semSkuQtd, semSkuList: Object.entries(preview.semSku).sort((a, b) => b[1] - a[1]) };
  })();

  return (
    <div className="rounded-2xl p-5 shadow-sm border" style={{ background: "#1F2937", borderColor: "#1F2937" }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-white">Importar pedidos da Shopee</h3>
          <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Exporte o relatório de pedidos (Concluídos e Enviados) do UpSeller e envie os .xlsx das suas contas de uma vez. Taxas reais e recebimento (entrega + 7 dias) calculados automaticamente.</p>
        </div>
        <label className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: "#2563EB", color: "#fff" }}>
          {processando ? "Lendo…" : "Escolher arquivos"}
          <input type="file" accept=".xlsx" multiple className="hidden" disabled={processando}
            onChange={(e) => { if (e.target.files?.length) lerArquivos(Array.from(e.target.files)); e.target.value = ""; }} />
        </label>
      </div>

      {preview && resumo && (
        <div className="mt-4 rounded-xl p-4" style={{ background: "#2B2723" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[["Vendas novas", preview.vendas.length, "#fff"], ["Receita", BRL(resumo.receita), "#fff"], ["Lucro estimado", BRL(resumo.lucro), "#F0C05A"], ["Líquido a receber", BRL(resumo.liquido), "#fff"]].map(([l, v, c]) => (
              <div key={l}>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>{l}</p>
                <p className="text-lg font-bold" style={{ color: c }}>{v}</p>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#D8CFBC" }}>
            {preview.itensTotais} itens lidos em {preview.arquivos} arquivo(s){preview.dup > 0 ? ` · ${preview.dup} já importados (ignorados)` : ""}
            {resumo.semSkuQtd > 0 ? ` · ${resumo.semSkuQtd} un. sem SKU correspondente` : ""}
          </p>
          {resumo.semSkuList.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer" style={{ color: "#E8C468" }}>⚠ {resumo.semSkuList.length} SKU(s) não reconhecido(s) — não serão importados</summary>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{resumo.semSkuList.map(([s, q]) => `${s} (${q})`).join(", ")}</p>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Cadastre esses SKUs em Produtos (ou ajuste o SKU do anúncio na Shopee) e reimporte.</p>
            </details>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setPreview(null)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "#374151", color: "#D8CFBC" }}>Cancelar</button>
            <button onClick={confirmar} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#2563EB" }}>
              Confirmar importação de {preview.vendas.length} vendas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarioRecebimentos({ vendas }) {
  const hoje = hojeISO();
  const futuras = vendas.filter((v) => v.recebimento && v.recebimento >= hoje);
  if (!futuras.length) return null;
  // agrupa por semana ISO (segunda a domingo)
  const semanas = {};
  for (const v of futuras) {
    const d = new Date(v.recebimento + "T12:00:00");
    const dia = (d.getDay() + 6) % 7; // 0=segunda
    const seg = new Date(d); seg.setDate(d.getDate() - dia);
    const chave = seg.toISOString().slice(0, 10);
    semanas[chave] = (semanas[chave] || 0) + lucroVenda(v).liquido;
  }
  const ordenadas = Object.entries(semanas).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 8);
  const max = Math.max(...ordenadas.map(([, v]) => v));
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
      <h3 className="font-semibold mb-1">Calendário de recebimentos (líquido)</h3>
      <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>Quanto e quando cai, com base na data de entrega + prazo de cada canal. Semana a partir da segunda-feira.</p>
      <div className="space-y-2">
        {ordenadas.map(([seg, val]) => {
          const segD = new Date(seg + "T12:00:00");
          const dom = new Date(segD); dom.setDate(segD.getDate() + 6);
          const label = `${String(segD.getDate()).padStart(2, "0")}/${String(segD.getMonth() + 1).padStart(2, "0")} a ${String(dom.getDate()).padStart(2, "0")}/${String(dom.getMonth() + 1).padStart(2, "0")}`;
          return (
            <div key={seg} className="flex items-center gap-3">
              <span className="text-xs w-28 shrink-0" style={{ color: "#6B7280" }}>{label}</span>
              <div className="flex-1 rounded-full h-6 overflow-hidden" style={{ background: "#EEF2F7" }}>
                <div className="h-full rounded-full flex items-center justify-end px-2" style={{ width: `${Math.max(8, (val / max) * 100)}%`, background: "#1F2937" }}>
                  <span className="text-xs font-semibold text-white whitespace-nowrap">{BRL(val)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImportadorTikTok({ produtos, insumos, marketplaces, vendas, onImport, setErro }) {
  const [mapa, setMapa] = useState(null);        // sku_id -> seller_sku
  const [preview, setPreview] = useState(null);
  const [processando, setProcessando] = useState(false);

  const jaImportados = new Set(vendas.filter((v) => v.chave).map((v) => v.chave));

  const carregarDicionario = async (fileList) => {
    setProcessando(true);
    try {
      const zipFile = fileList.find((f) => /\.zip$/i.test(f.name));
      if (zipFile) {
        setErro("Você enviou o arquivo .zip. Descompacte-o primeiro (clique com o botão direito → Extrair) e envie os arquivos .xlsx que estão dentro dele.");
        setProcessando(false);
        return;
      }
      const XLSX = await import("xlsx");
      let m = {};
      let erros = [];
      for (const file of fileList) {
        try {
          const buf = await file.arrayBuffer();
          const bytes = new Uint8Array(buf);
          const wb = XLSX.read(bytes, { type: "array", cellDates: false });
          const nomeAba = wb.SheetNames.find((n) => n.toLowerCase() === "template") || wb.SheetNames[0];
          const ws = wb.Sheets[nomeAba];
          if (!ws) { erros.push(file.name + " (sem aba)"); continue; }
          const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
          const parcial = mapaTikTok(linhas);
          Object.assign(m, parcial);
        } catch (err) {
          erros.push(file.name);
        }
      }
      if (Object.keys(m).length === 0) {
        if (erros.length) {
          setErro("Não consegui abrir: " + erros.join(", ") + ". Confirme que são os .xlsx extraídos do 'batch edit / all information template' do TikTok (não o .zip, e não o relatório de vendas).");
        } else {
          setErro("Li os arquivos, mas não encontrei o mapeamento de SKUs. O arquivo certo é o 'batch edit / all information template' do TikTok, que tem a aba Template com as colunas ID do SKU e SKU do vendedor.");
        }
        setProcessando(false);
        return;
      }
      setMapa(m);
    } catch (e) {
      setErro("Não consegui ler o template. Descompacte o .zip e envie os .xlsx de dentro (o 'batch edit / all information template' do TikTok).");
    }
    setProcessando(false);
  };

  const carregarRelatorio = async (file) => {
    if (!mapa) { setErro("Primeiro carregue o dicionário (batch edit). Depois envie a merchant statement."); return; }
    setProcessando(true);
    try {
      if (/\.zip$/i.test(file.name)) { setErro("Esse é um .zip. Envie o arquivo .xlsx da merchant statement (profit & loss)."); setProcessando(false); return; }
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const wb = XLSX.read(bytes, { type: "array", cellDates: false });
      const nomeAba = wb.SheetNames.find((n) => n.toLowerCase() === "orders") || wb.SheetNames[0];
      const ws = wb.Sheets[nomeAba];
      const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
      const res = processarTikTok(linhas, mapa, produtos, insumos, marketplaces, jaImportados);
      if (!res.vendas.length && !res.semMapa.length && !Object.keys(res.semSku).length) {
        setErro("Li o arquivo, mas não encontrei pedidos. Confirme que é a 'merchant statement (profit & loss)' do TikTok, que tem a aba Orders.");
        setProcessando(false);
        return;
      }
      setPreview(res);
    } catch (e) {
      setErro("Não consegui ler a merchant statement do TikTok. Envie o arquivo .xlsx 'merchant_statement_profit_loss'.");
    }
    setProcessando(false);
  };

  const resumo = preview && (() => {
    const liquido = preview.vendas.reduce((s, v) => s + lucroVenda(v).liquido, 0);
    const lucro = preview.vendas.reduce((s, v) => s + lucroVenda(v).lucro, 0);
    const semSkuQtd = Object.values(preview.semSku).reduce((s, q) => s + q, 0);
    return { liquido, lucro, semSkuQtd };
  })();

  return (
    <div className="rounded-2xl p-5 shadow-sm border" style={{ background: "#2B2723", borderColor: "#2B2723" }}>
      <h3 className="font-semibold text-white">Importar vendas do TikTok Shop</h3>
      <p className="text-xs mt-1 mb-4" style={{ color: "#9CA3AF" }}>
        Use a <strong>merchant statement</strong> (profit &amp; loss): ela traz o ganho líquido real e a data de liquidação de cada pedido. O "batch edit" liga o SKU ID ao seu SKU. Carregue os dois: primeiro o dicionário, depois a statement. <span style={{ color: "#9CA3AF" }}>Se o batch edit veio em .zip, descompacte antes e envie os .xlsx de dentro.</span>
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{ background: mapa ? "#4A6B3C" : "#374151", color: "#fff" }}>1</span>
          <label className="px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: "#374151", color: "#fff" }}>
            Carregar dicionário (batch edit)
            <input type="file" accept=".xlsx,.zip" multiple className="hidden" disabled={processando}
              onChange={(e) => { if (e.target.files?.length) carregarDicionario(Array.from(e.target.files)); e.target.value = ""; }} />
          </label>
          {mapa && <span className="text-xs" style={{ color: "#9DB08F" }}>✓ {Object.keys(mapa).length} SKUs mapeados</span>}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{ background: preview ? "#4A6B3C" : "#374151", color: "#fff" }}>2</span>
          <label className="px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: mapa ? "#2563EB" : "#374151", color: "#fff", opacity: mapa ? 1 : 0.5 }}>
            Carregar merchant statement
            <input type="file" accept=".xlsx" className="hidden" disabled={processando || !mapa}
              onChange={(e) => { if (e.target.files?.[0]) carregarRelatorio(e.target.files[0]); e.target.value = ""; }} />
          </label>
        </div>
      </div>

      {preview && resumo && (
        <div className="mt-4 rounded-xl p-4" style={{ background: "#1F2937" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {[["Vendas novas", preview.vendas.length, "#fff"], ["Ganho líquido real", BRL(resumo.liquido), "#fff"], ["Lucro real", BRL(resumo.lucro), "#F0C05A"]].map(([l, v, c]) => (
              <div key={l}>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>{l}</p>
                <p className="text-lg font-bold" style={{ color: c }}>{v}</p>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#D8CFBC" }}>
            {preview.itensTotais} pedidos lidos
            {preview.cancelados > 0 ? ` · ${preview.cancelados} cancelados ignorados` : ""}
            {preview.dup > 0 ? ` · ${preview.dup} já importados` : ""}
            {preview.semMapa.length > 0 ? ` · ${preview.semMapa.length} SKU ID sem dicionário` : ""}
            {resumo.semSkuQtd > 0 ? ` · ${resumo.semSkuQtd} un. sem produto` : ""}
          </p>
          {preview.semMapa.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer" style={{ color: "#E8C468" }}>⚠ {preview.semMapa.length} SKU ID sem correspondência no dicionário</summary>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Produtos criados depois do template exportado. Exporte um novo "batch edit" e recarregue o dicionário. IDs: {preview.semMapa.slice(0, 10).join(", ")}{preview.semMapa.length > 10 ? "…" : ""}</p>
            </details>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setPreview(null)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "#374151", color: "#D8CFBC" }}>Cancelar</button>
            <button onClick={() => { onImport(preview.vendas); setPreview(null); }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#2563EB" }}>
              Confirmar importação de {preview.vendas.length} vendas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ============ EMPRESA (LASER / ROUTER) ============
function empresaDoSku(sku) {
  const m = String(sku || "").match(/^\s*(\d+)/);
  if (!m) return "LASER";
  const n = parseInt(m[1], 10);
  if (n === 2 || n === 7 || n === 9 || (n >= 25 && n <= 36)) return "ROUTER";
  return "LASER";
}

// ============ VENDAS (Tiny) — filtros e empresa ============
// ====== Cores, gráficos (SVG puro, sem dependências) e helpers ======
const PALETA = ["#2563EB", "#16A34A", "#F59E0B", "#DC2626", "#7C3AED", "#0EA5E9", "#14B8A6", "#EC4899"];

function corSituacao(sit) {
  const t = String(sit || "").toLowerCase();
  if (t.includes("entreg") && !t.includes("nao") && !t.includes("não")) return { bg: "#E4F1E8", fg: "#16A34A" };
  if (t.includes("envi")) return { bg: "#E3EDF6", fg: "#2F5E8C" };
  if (t.includes("aprov")) return { bg: "#E5F0EC", fg: "#2E7D6F" };
  if (t.includes("aberto")) return { bg: "#FBF0D9", fg: "#9A6B12" };
  if (t.includes("cancel") || t.includes("devolv")) return { bg: "#F7E3DF", fg: "#DC2626" };
  return { bg: "#EEE9DF", fg: "#6B7280" };
}

function parseDataFlex(s) {
  if (!s) return null;
  const str = String(s).trim();
  if (!str) return null;
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}

const cardBox = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };

function Pizza({ dados, titulo }) {
  const validos = (dados || []).filter((d) => d.valor > 0);
  const total = validos.reduce((s, d) => s + d.valor, 0);
  const cx = 70, cy = 70, r = 62;
  let ang = -90;
  const arcos = validos.map((d, i) => {
    const frac = d.valor / (total || 1);
    const a0 = ang, a1 = ang + frac * 360; ang = a1;
    const large = frac > 0.5 ? 1 : 0;
    const rad = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = rad(a0), [x1, y1] = rad(a1);
    const path = validos.length === 1
      ? `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0`
      : `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
    return { path, cor: d.cor || PALETA[i % PALETA.length], label: d.label, pct: frac * 100 };
  });
  return (
    <div style={cardBox}>
      <p className="text-sm font-semibold mb-2" style={{ color: "#374151" }}>{titulo}</p>
      {total === 0 ? <p className="text-xs" style={{ color: "#9CA3AF" }}>Sem dados.</p> : (
        <div className="flex items-center gap-3">
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
            {arcos.map((a, i) => <path key={i} d={a.path} fill={a.cor} stroke="#FFF" strokeWidth="1.5" />)}
            <circle cx={cx} cy={cy} r="28" fill="#FFF" />
          </svg>
          <div className="flex-1 space-y-1 min-w-0">
            {arcos.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span style={{ width: 10, height: 10, borderRadius: 2, background: a.cor, display: "inline-block", flexShrink: 0 }} />
                <span className="flex-1 truncate" style={{ color: "#6B7280" }}>{a.label}</span>
                <span className="font-medium" style={{ color: "#374151" }}>{a.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Torre({ dados, titulo, cor = "#2563EB", formato }) {
  const fmt = formato || ((n) => String(Math.round(n)));
  const max = Math.max(...(dados || []).map((d) => d.valor), 1);
  return (
    <div style={cardBox}>
      <p className="text-sm font-semibold mb-3" style={{ color: "#374151" }}>{titulo}</p>
      {(!dados || dados.length === 0) ? <p className="text-xs" style={{ color: "#9CA3AF" }}>Sem dados.</p> : (
        <div className="flex items-end gap-1" style={{ height: 150 }}>
          {dados.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end min-w-0" title={d.label + ": " + fmt(d.valor)}>
              <span className="text-[9px] mb-1 whitespace-nowrap" style={{ color: "#6B7280" }}>{d.valor > 0 ? fmt(d.valor) : ""}</span>
              <div style={{ width: "78%", height: Math.max(2, (d.valor / max) * 110), background: d.cor || cor, borderRadius: "3px 3px 0 0" }} />
              <span className="text-[9px] mt-1 truncate w-full text-center" style={{ color: "#9CA3AF" }}>{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VendasTiny({ produtos, insumos, marketplaces }) {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aoVivo, setAoVivo] = useState(false);
  const [filtro, setFiltro] = useState("pagos");
  const [ignorarGratis, setIgnorarGratis] = useState(true); // pedidos R$0 (brindes/afiliados TikTok) fora por padrão
  const [empresa, setEmpresa] = useState("todas");
  const [canalF, setCanalF] = useState("todos");
  const [busca, setBusca] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pagina, setPagina] = useState(1);
  const [subAba, setSubAba] = useState("pedidos");
  const [pagSku, setPagSku] = useState(1);
  const [ordSku, setOrdSku] = useState("lucro");
  const POR_PAGINA = 50;

  async function carregar() {
    // O Supabase limita cada requisição a 1000 linhas (o .limit(3000) era
    // ignorado). Aqui buscamos em páginas de 1000 até trazer TODOS os pedidos,
    // senão os totais (faturamento etc.) ficam incompletos em dias movimentados.
    const tamanho = 1000;
    let inicio = 0, todas = [], erroMsg = "";
    for (;;) {
      const { data, error } = await supabase
        .from("vendas").select("*")
        .order("data_pedido", { ascending: false })
        .range(inicio, inicio + tamanho - 1);
      if (error) { erroMsg = error.message; break; }
      todas = todas.concat(data || []);
      if (!data || data.length < tamanho) break;
      inicio += tamanho;
      if (inicio > 200000) break; // trava de seguranca
    }
    if (erroMsg) setErro(erroMsg);
    else { setVendas(todas); setErro(""); }
    setCarregando(false);
  }
  useEffect(() => {
    carregar();
    const canal = supabase
      .channel("vendas-tempo-real")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendas" }, (payload) => {
        const nova = payload.new;
        if (!nova || !nova.id) return;
        setVendas((atual) => {
          const semEla = atual.filter((v) => v.id !== nova.id);
          return [nova, ...semEla].sort((a, b) => String(b.data_pedido || "").localeCompare(String(a.data_pedido || "")));
        });
      })
      .subscribe((status) => setAoVivo(status === "SUBSCRIBED"));
    return () => { supabase.removeChannel(canal); };
  }, []);

  function ehPaga(sit) {
    const t = String(sit || "").toLowerCase();
    return !(t.includes("aberto") || t.includes("cancel") || t.includes("incomplet") || t.includes("nao entregue") || t.includes("não entregue") || t.includes("devolv"));
  }
  function acharMarketplace(canal) {
    if (!canal) return null;
    const c = String(canal).toLowerCase();
    const byId = (id) => marketplaces.find((m) => m.id === id);
    if (c.includes("shopee")) return byId("shopee");
    if (c.includes("tiktok")) return byId("tiktok");
    if (c.includes("shein")) return byId("shein");
    if (c.includes("mercado") || c.includes("ml")) return byId("ml-classico");
    return marketplaces.find((m) => String(m.nome || "").toLowerCase().includes(c)) || null;
  }
  function grupoCanal(canal) {
    const c = String(canal || "").toLowerCase();
    if (c.includes("shopee")) return "Shopee";
    if (c.includes("tiktok")) return "TikTok";
    if (c.includes("shein")) return "SHEIN";
    if (c.includes("mercado") || c.includes("ml")) return "Mercado Livre";
    return canal || "Outro";
  }
  function empresaDaVenda(v) {
    for (const it of v.itens || []) {
      const prod = casarSku(it.sku, produtos);
      const e = (prod && prod.empresa) || empresaDoSku((prod && prod.sku) || it.sku);
      if (e) return e;
    }
    return "LASER";
  }
  function calc(v) {
    const mp = acharMarketplace(v.canal);
    const fator = fatorDesconto(v); // rateia o desconto do pedido entre os itens
    let receita = 0, custo = 0, taxas = 0, imposto = 0, semSku = 0;
    for (const it of v.itens || []) {
      const q = num(it.quantidade) || 0;
      const pu = (num(it.valor_unitario) || 0) * fator; // preço realmente pago
      receita += pu * q;
      const prod = casarSku(it.sku, produtos);
      if (prod) {
        custo += custoProduto(prod, insumos) * q;
        imposto += pu * q * (num(prod.imposto) / 100);
        taxas += mp ? taxasDoPreco(mp, pu, pesoConsiderado(prod)) * q : 0;
      } else {
        semSku += q;
        taxas += mp ? taxasDoPreco(mp, pu, 0) * q : 0;
      }
    }
    const lucro = receita - custo - taxas - imposto;
    // Faturamento = total do pedido COM frete, já descontados só os descontos.
    // É o valor_total do Tiny (= produtos + frete - desconto).
    // receita/custo/lucro/margem são por item, com o desconto do pedido rateado
    // proporcionalmente (fatorDesconto); faturamento é a linha de topo.
    const faturamento = num(v.valor_total);
    return { receita, faturamento, custo, taxas, imposto, lucro, margem: receita ? (lucro / receita) * 100 : 0, mp, semSku };
  }

  const enriquecidas = useMemo(() => vendas.map((v) => ({
    v, c: calc(v), emp: empresaDaVenda(v), grupo: grupoCanal(v.canal),
  })), [vendas, produtos, insumos, marketplaces]);
  const canaisPresentes = useMemo(() => Array.from(new Set(enriquecidas.map((x) => x.grupo))), [enriquecidas]);

  function matchBusca(v) {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return (v.itens || []).some((it) => {
      const prod = casarSku(it.sku, produtos);
      return String(it.sku || "").toLowerCase().includes(q)
        || String(it.descricao || "").toLowerCase().includes(q)
        || (prod && String(prod.nome || "").toLowerCase().includes(q));
    });
  }
  // linhasBase = passa em todos os filtros MENOS o de situação (usado nos gráficos por situação)
  const linhasBase = enriquecidas.filter(({ v, emp, grupo }) => {
    if (ignorarGratis && num(v.valor_total) <= 0) return false; // brindes p/ afiliados (TikTok etc.)
    if (empresa !== "todas" && emp !== empresa) return false;
    if (canalF !== "todos" && grupo !== canalF) return false;
    if (dataIni && String(v.data_pedido || "") < dataIni) return false;
    if (dataFim && String(v.data_pedido || "") > dataFim) return false;
    if (!matchBusca(v)) return false;
    return true;
  });
  const linhas = filtro === "pagos" ? linhasBase.filter(({ v }) => ehPaga(v.situacao)) : linhasBase;
  // volta para a página 1 quando muda filtro/busca/dados
  useEffect(() => { setPagina(1); }, [empresa, canalF, filtro, busca, dataIni, dataFim, vendas.length, ignorarGratis]);
  useEffect(() => { setPagSku(1); }, [empresa, canalF, filtro, busca, dataIni, dataFim, vendas.length, ordSku, ignorarGratis]);
  const totalPaginas = Math.max(1, Math.ceil(linhas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const linhasPagina = linhas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const tot = linhas.reduce((s, { c }) => ({
    receita: s.receita + c.receita, faturamento: s.faturamento + c.faturamento, custo: s.custo + c.custo, taxas: s.taxas + c.taxas,
    imposto: s.imposto + c.imposto, lucro: s.lucro + c.lucro,
  }), { receita: 0, faturamento: 0, custo: 0, taxas: 0, imposto: 0, lucro: 0 });
  const margemMedia = tot.receita ? (tot.lucro / tot.receita) * 100 : 0;

  // ====== dados dos gráficos ======
  const BRLk = (n) => "R$ " + (Math.abs(n) >= 1000 ? (n / 1000).toFixed(1) + "k" : n.toFixed(0));
  const porMarket = (() => {
    const m = {};
    linhas.forEach(({ v, c }) => { const g = grupoCanal(v.canal); m[g] = (m[g] || 0) + c.faturamento; });
    return Object.entries(m).map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
  })();
  const porSituacao = (() => {
    const m = {};
    linhasBase.forEach(({ v }) => { const s = v.situacao || "—"; m[s] = (m[s] || 0) + 1; });
    return Object.entries(m).map(([label, valor]) => ({ label, valor, cor: corSituacao(label).fg })).sort((a, b) => b.valor - a.valor);
  })();
  const porDia = (() => {
    const m = {};
    linhas.forEach(({ v, c }) => { const d = v.data_pedido; if (d) m[d] = (m[d] || 0) + c.faturamento; });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])).slice(-14)
      .map(([d, valor]) => ({ label: d.slice(8, 10) + "/" + d.slice(5, 7), valor }));
  })();

  // ====== ranking por SKU (lucro por item, respeita os filtros ativos) ======
  const porSku = (() => {
    const m = {};
    for (const { v, c } of linhas) {
      const mp = c.mp;
      const fator = fatorDesconto(v); // mesmo rateio de desconto usado em calc()
      for (const it of v.itens || []) {
        const q = num(it.quantidade) || 0;
        const pu = (num(it.valor_unitario) || 0) * fator; // preço realmente pago
        const prod = casarSku(it.sku, produtos);
        const receita = pu * q;
        let custo = 0, imposto = 0, taxas = 0;
        if (prod) {
          custo = custoProduto(prod, insumos) * q;
          imposto = pu * q * (num(prod.imposto) / 100);
          taxas = mp ? taxasDoPreco(mp, pu, pesoConsiderado(prod)) * q : 0;
        } else {
          taxas = mp ? taxasDoPreco(mp, pu, 0) * q : 0;
        }
        const lucro = receita - custo - taxas - imposto;
        const sku = String(it.sku || "").trim() || "(sem SKU)";
        const k = sku.toLowerCase();
        if (!m[k]) m[k] = { sku, nome: (prod && prod.nome) || it.descricao || "(sem cadastro)", empresa: prod ? (prod.empresa || empresaDoSku(prod.sku) || "") : "", temProd: !!prod, qtd: 0, pedidos: new Set(), receita: 0, custo: 0, taxas: 0, imposto: 0, lucro: 0 };
        const r = m[k];
        if (prod && !r.temProd) { r.temProd = true; r.nome = prod.nome; r.empresa = prod.empresa || empresaDoSku(prod.sku) || ""; }
        r.qtd += q; r.receita += receita; r.custo += custo; r.taxas += taxas; r.imposto += imposto; r.lucro += lucro;
        r.pedidos.add(v.id);
      }
    }
    const arr = Object.values(m).map((r) => ({
      sku: r.sku, nome: r.nome, empresa: r.empresa, temProd: r.temProd,
      qtd: r.qtd, pedidos: r.pedidos.size, receita: r.receita, custo: r.custo,
      encargos: r.taxas + r.imposto, lucro: r.lucro,
      margem: r.receita ? (r.lucro / r.receita) * 100 : 0,
      lucroUnit: r.qtd ? r.lucro / r.qtd : 0,
    }));
    const ord = { lucro: (a, b) => b.lucro - a.lucro, qtd: (a, b) => b.qtd - a.qtd, margem: (a, b) => b.margem - a.margem, receita: (a, b) => b.receita - a.receita };
    return arr.sort(ord[ordSku] || ord.lucro);
  })();
  const skuTop = porSku.slice(0, 10).map((r) => ({ label: r.sku.length > 14 ? r.sku.slice(0, 13) + "…" : r.sku, valor: r.lucro }));
  const totSku = porSku.reduce((s, r) => ({ lucro: s.lucro + r.lucro, receita: s.receita + r.receita, qtd: s.qtd + r.qtd }), { lucro: 0, receita: 0, qtd: 0 });
  const totalPagSku = Math.max(1, Math.ceil(porSku.length / POR_PAGINA));
  const pagSkuAtual = Math.min(pagSku, totalPagSku);
  const skuPagina = porSku.slice((pagSkuAtual - 1) * POR_PAGINA, pagSkuAtual * POR_PAGINA);

  async function baixarSkuExcel() {
    const XLSX = await import("xlsx");
    const rows = porSku.map((r) => ({
      SKU: r.sku, Produto: r.nome, Empresa: r.empresa,
      "Qtd vendida": r.qtd, Pedidos: r.pedidos,
      "Receita (R$)": Math.round(r.receita * 100) / 100,
      "Custo (R$)": Math.round(r.custo * 100) / 100,
      "Taxas+Imposto (R$)": Math.round(r.encargos * 100) / 100,
      "Lucro (R$)": Math.round(r.lucro * 100) / 100,
      "Lucro/un (R$)": Math.round(r.lucroUnit * 100) / 100,
      "Margem (%)": Math.round(r.margem * 10) / 10,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ranking SKU");
    XLSX.writeFile(wb, "ranking-sku-lucro.xlsx");
  }

  // ====== previsão de recebimento (dias após entrega, por marketplace) ======
  const hoje0 = new Date(); hoje0.setHours(0, 0, 0, 0);
  const recebiveis = linhasBase
    .filter(({ v }) => { const t = String(v.situacao || "").toLowerCase(); return (t.includes("aprov") || t.includes("envi") || t.includes("entreg")) && !t.includes("cancel") && !t.includes("devolv"); })
    .map(({ v, c }) => {
      const prazo = c.mp ? (num(c.mp.prazoDias) || 15) : 15;
      const dEntrega = parseDataFlex(v.payload_raw && v.payload_raw.data_entrega);
      const dEnvio = parseDataFlex(v.payload_raw && v.payload_raw.data_envio);
      let entrega;
      if (dEntrega) entrega = dEntrega;
      else if (dEnvio) { entrega = new Date(dEnvio); entrega.setDate(entrega.getDate() + 5); }
      else { const dp = parseDataFlex(v.data_pedido) || hoje0; entrega = new Date(dp); entrega.setDate(entrega.getDate() + 8); }
      const receb = new Date(entrega); receb.setDate(receb.getDate() + prazo);
      return { receb, liquido: num(v.valor_total) - c.taxas, estimado: !dEntrega };
    });
  const totalReceber = recebiveis.reduce((s, r) => s + r.liquido, 0);
  const receber7 = recebiveis.filter((r) => { const dif = (r.receb - hoje0) / 86400000; return dif >= 0 && dif <= 7; }).reduce((s, r) => s + r.liquido, 0);
  const segundaDe = (d) => { const x = new Date(d); const w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); x.setHours(0, 0, 0, 0); return x; };
  const porSemana = (() => {
    const m = {};
    recebiveis.forEach((r) => { const k = segundaDe(r.receb).getTime(); m[k] = (m[k] || 0) + r.liquido; });
    return Object.entries(m).map(([k, valor]) => ({ k: +k, valor })).sort((a, b) => a.k - b.k).slice(0, 8)
      .map((x) => { const d = new Date(x.k); return { label: String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"), valor: x.valor }; });
  })();

  const card = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };
  const ctrl = { borderColor: "#E5E7EB", background: "#FFFFFF" };
  function limpar() { setEmpresa("todas"); setCanalF("todos"); setBusca(""); setDataIni(""); setDataFim(""); setFiltro("pagos"); setIgnorarGratis(true); }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#1F2937" }}>Vendas</h2>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>Vendas vindas do Tiny, em tempo real, com lucro calculado.{" "}{aoVivo ? "🟢 Ao vivo" : "⚪ Conectando..."}</p>
        </div>
        <button onClick={carregar} className="px-3 py-2 rounded-lg text-sm" style={{ background: "#1F2937", color: "#F4F5F7" }}>Atualizar</button>
      </div>
      <div className="flex gap-2 mb-4">
        {[["pedidos", "Pedidos"], ["skus", "Ranking de SKUs"]].map(([k, rotulo]) => (
          <button key={k} onClick={() => setSubAba(k)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={subAba === k
              ? { background: "#1F2937", color: "#F4F5F7" }
              : { background: "#F1F5F9", color: "#475569" }}>
            {rotulo}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-2 mb-4">
        <label className="text-xs" style={{ color: "#6B7280" }}>Empresa
          <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl}>
            <option value="todas">Todas</option><option value="LASER">LASER</option><option value="ROUTER">ROUTER</option>
          </select>
        </label>
        <label className="text-xs" style={{ color: "#6B7280" }}>Marketplace
          <select value={canalF} onChange={(e) => setCanalF(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl}>
            <option value="todos">Todos</option>{canaisPresentes.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="text-xs" style={{ color: "#6B7280" }}>Situacao
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl}>
            <option value="pagos">Somente pagos</option><option value="todos">Todos</option>
          </select>
        </label>
        <label className="text-xs" style={{ color: "#6B7280" }}>De
          <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl} />
        </label>
        <label className="text-xs" style={{ color: "#6B7280" }}>Ate
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl} />
        </label>
        <label className="text-xs flex-1 min-w-[180px]" style={{ color: "#6B7280" }}>Produto (SKU ou nome)
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="block w-full px-2 py-2 rounded-lg border text-sm" style={ctrl} />
        </label>
        <label className="text-xs flex items-center gap-1.5 px-2 py-2 rounded-lg border cursor-pointer select-none" style={{ ...ctrl, color: "#6B7280" }} title="Pedidos com valor total R$ 0,00 (ex.: amostras grátis para afiliados do TikTok Shop) ficam fora das vendas, dos gráficos e do ranking de SKUs.">
          <input type="checkbox" checked={ignorarGratis} onChange={(e) => setIgnorarGratis(e.target.checked)} />
          Ignorar pedidos R$ 0,00 (brindes/afiliados)
        </label>
        <button onClick={limpar} className="px-3 py-2 rounded-lg border text-sm" style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>Limpar</button>
      </div>
      {erro && <p className="text-sm mb-3" style={{ color: "#DC2626" }}>Erro: {erro}</p>}
      {subAba === "pedidos" && (
      <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Faturamento <span title="Total do pedido com frete, já descontados os descontos (valor_total, igual ao Tiny)">ⓘ</span></p><p className="text-lg font-semibold">{BRL(tot.faturamento)}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Lucro</p><p className="text-lg font-semibold" style={{ color: tot.lucro >= 0 ? "#16A34A" : "#DC2626" }}>{BRL(tot.lucro)}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Margem media</p><p className="text-lg font-semibold">{isFinite(margemMedia) ? margemMedia.toFixed(1) + "%" : "—"}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>N de vendas</p><p className="text-lg font-semibold">{linhas.length}</p></div>
      </div>

      {!carregando && linhas.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div style={{ ...card, borderLeft: "4px solid #16A34A" }}>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>A receber (previsto, líquido)</p>
              <p className="text-lg font-semibold" style={{ color: "#16A34A" }}>{BRL(totalReceber)}</p>
            </div>
            <div style={{ ...card, borderLeft: "4px solid #2563EB" }}>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Entra nos próximos 7 dias</p>
              <p className="text-lg font-semibold" style={{ color: "#2563EB" }}>{BRL(receber7)}</p>
            </div>
            <div style={{ ...card, borderLeft: "4px solid #3E6B8C" }}>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Pedidos a receber</p>
              <p className="text-lg font-semibold" style={{ color: "#3E6B8C" }}>{recebiveis.length}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <Torre titulo="Recebimentos previstos por semana" dados={porSemana} cor="#16A34A" formato={BRLk} />
            <Torre titulo="Faturamento por dia" dados={porDia} cor="#2563EB" formato={BRLk} />
            <Pizza titulo="Faturamento por marketplace" dados={porMarket} />
            <Pizza titulo="Pedidos por situação" dados={porSituacao} />
          </div>
          <p className="text-[11px] mb-4" style={{ color: "#9CA3AF" }}>
            Recebimento previsto = data de entrega + prazo do marketplace (editável em Marketplaces). Enquanto a entrega não é confirmada pelo Tiny, a data é estimada. Cancelados/devolvidos ficam de fora.
          </p>
        </>
      )}

      {carregando ? (
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Carregando vendas...</p>
      ) : linhas.length === 0 ? (
        <div style={card}><p className="text-sm" style={{ color: "#6B7280" }}>Nenhuma venda com esses filtros.</p></div>
      ) : (
        <div className="overflow-x-auto" style={card}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "#9CA3AF", textAlign: "left" }}>
                <th className="py-2 pr-3">Data</th><th className="py-2 pr-3">Pedido</th><th className="py-2 pr-3">Empresa</th>
                <th className="py-2 pr-3">Canal</th><th className="py-2 pr-3">Situacao</th><th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3 text-right">Itens</th><th className="py-2 pr-3 text-right">Receita</th><th className="py-2 pr-3 text-right">Custo</th>
                <th className="py-2 pr-3 text-right">Taxas</th><th className="py-2 pr-3 text-right">Imposto</th><th className="py-2 pr-3 text-right">Lucro</th><th className="py-2 pr-3 text-right">Margem</th>
              </tr>
            </thead>
            <tbody>
              {linhasPagina.map(({ v, c, emp }) => (
                <tr key={v.id} style={{ borderTop: "1px solid #EEF0F2", opacity: ehPaga(v.situacao) ? 1 : 0.55 }}>
                  <td className="py-2 pr-3">{fmtData(v.data_pedido)}</td>
                  <td className="py-2 pr-3">{v.numero || "—"}</td>
                  <td className="py-2 pr-3"><span className="px-2 py-0.5 rounded text-[11px]" style={{ background: emp === "ROUTER" ? "#EFF6FF" : "#F1F5F9", color: "#374151" }}>{emp}</span></td>
                  <td className="py-2 pr-3">{v.canal || "—"}</td>
                  <td className="py-2 pr-3"><span className="px-2 py-0.5 rounded text-[11px] whitespace-nowrap" style={{ background: corSituacao(v.situacao).bg, color: corSituacao(v.situacao).fg }}>{v.situacao || "—"}</span></td>
                  <td className="py-2 pr-3">{v.cliente_nome || "—"}</td>
                  <td className="py-2 pr-3 text-right">{(v.itens || []).length}{c.semSku ? " ⚠" : ""}</td>
                  <td className="py-2 pr-3 text-right">{BRL(c.receita)}</td>
                  <td className="py-2 pr-3 text-right">{BRL(c.custo)}</td>
                  <td className="py-2 pr-3 text-right">{BRL(c.taxas)}</td>
                  <td className="py-2 pr-3 text-right">{BRL(c.imposto)}</td>
                  <td className="py-2 pr-3 text-right" style={{ color: c.lucro >= 0 ? "#16A34A" : "#DC2626", fontWeight: 500 }}>{BRL(c.lucro)}</td>
                  <td className="py-2 pr-3 text-right">{isFinite(c.margem) ? c.margem.toFixed(0) + "%" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              Mostrando {(paginaAtual - 1) * POR_PAGINA + 1}–{Math.min(paginaAtual * POR_PAGINA, linhas.length)} de {linhas.length}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagina(paginaAtual - 1)} disabled={paginaAtual <= 1}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
                style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>← Anterior</button>
              <span className="text-xs" style={{ color: "#6B7280" }}>Página {paginaAtual} de {totalPaginas}</span>
              <button onClick={() => setPagina(paginaAtual + 1)} disabled={paginaAtual >= totalPaginas}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
                style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>Próxima →</button>
            </div>
          </div>
          <p className="text-[11px] mt-3" style={{ color: "#9CA3AF" }}>"Somente pagos" exclui em aberto/cancelados/incompletos. Empresa vem do produto (regra de SKU, editavel). ⚠ = item sem SKU no catalogo.</p>
        </div>
      )}
      </>
      )}

      {subAba === "skus" && (
        carregando ? (
          <p className="text-sm" style={{ color: "#9CA3AF" }}>Carregando vendas...</p>
        ) : !porSku.length ? (
          <div style={card}><p className="text-sm" style={{ color: "#6B7280" }}>Nenhuma venda com esses filtros.</p></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div style={{ ...card, borderLeft: "4px solid #16A34A" }}><p className="text-xs" style={{ color: "#9CA3AF" }}>Lucro total (itens)</p><p className="text-lg font-semibold" style={{ color: totSku.lucro >= 0 ? "#16A34A" : "#DC2626" }}>{BRL(totSku.lucro)}</p></div>
              <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>SKUs distintos</p><p className="text-lg font-semibold">{porSku.length}</p></div>
              <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Unidades vendidas</p><p className="text-lg font-semibold">{totSku.qtd.toLocaleString("pt-BR")}</p></div>
              <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Margem media</p><p className="text-lg font-semibold">{totSku.receita ? (totSku.lucro / totSku.receita * 100).toFixed(1) + "%" : "—"}</p></div>
            </div>

            <div className="mb-5">
              <Torre titulo="Top 10 SKUs por lucro" dados={skuTop} cor="#16A34A" formato={BRLk} />
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <label className="text-xs" style={{ color: "#6B7280" }}>Ordenar por
                <select value={ordSku} onChange={(e) => setOrdSku(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl}>
                  <option value="lucro">Maior lucro</option>
                  <option value="qtd">Mais vendidos (un.)</option>
                  <option value="margem">Maior margem</option>
                  <option value="receita">Maior receita</option>
                </select>
              </label>
              <button onClick={baixarSkuExcel} className="px-3 py-2 rounded-lg border text-sm self-end" style={{ color: "#1F2937", borderColor: "#E5E7EB" }}>Baixar Excel</button>
            </div>

            <div className="overflow-x-auto" style={card}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: "#9CA3AF", textAlign: "left" }}>
                    <th className="py-2 pr-3">#</th><th className="py-2 pr-3">SKU</th><th className="py-2 pr-3">Produto</th><th className="py-2 pr-3">Empresa</th>
                    <th className="py-2 pr-3 text-right">Qtd</th><th className="py-2 pr-3 text-right">Pedidos</th>
                    <th className="py-2 pr-3 text-right">Receita</th><th className="py-2 pr-3 text-right">Custo</th>
                    <th className="py-2 pr-3 text-right">Taxas+Imp.</th><th className="py-2 pr-3 text-right">Lucro</th>
                    <th className="py-2 pr-3 text-right">Lucro/un</th><th className="py-2 pr-3 text-right">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {skuPagina.map((r, i) => (
                    <tr key={r.sku} style={{ borderTop: "1px solid #EEF0F2", opacity: r.temProd ? 1 : 0.6 }}>
                      <td className="py-2 pr-3" style={{ color: "#9CA3AF" }}>{(pagSkuAtual - 1) * POR_PAGINA + i + 1}</td>
                      <td className="py-2 pr-3 font-medium">{r.sku}{r.temProd ? "" : " ⚠"}</td>
                      <td className="py-2 pr-3">{r.nome}</td>
                      <td className="py-2 pr-3">{r.empresa ? <span className="px-2 py-0.5 rounded text-[11px]" style={{ background: r.empresa === "ROUTER" ? "#EFF6FF" : "#F1F5F9", color: "#374151" }}>{r.empresa}</span> : "—"}</td>
                      <td className="py-2 pr-3 text-right">{r.qtd.toLocaleString("pt-BR")}</td>
                      <td className="py-2 pr-3 text-right">{r.pedidos}</td>
                      <td className="py-2 pr-3 text-right">{BRL(r.receita)}</td>
                      <td className="py-2 pr-3 text-right">{BRL(r.custo)}</td>
                      <td className="py-2 pr-3 text-right">{BRL(r.encargos)}</td>
                      <td className="py-2 pr-3 text-right" style={{ color: r.lucro >= 0 ? "#16A34A" : "#DC2626", fontWeight: 600 }}>{BRL(r.lucro)}</td>
                      <td className="py-2 pr-3 text-right" style={{ color: r.lucroUnit >= 0 ? "#16A34A" : "#DC2626" }}>{BRL(r.lucroUnit)}</td>
                      <td className="py-2 pr-3 text-right">{isFinite(r.margem) ? r.margem.toFixed(0) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <span className="text-xs" style={{ color: "#9CA3AF" }}>
                  Mostrando {(pagSkuAtual - 1) * POR_PAGINA + 1}–{Math.min(pagSkuAtual * POR_PAGINA, porSku.length)} de {porSku.length}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPagSku(pagSkuAtual - 1)} disabled={pagSkuAtual <= 1}
                    className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
                    style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>← Anterior</button>
                  <span className="text-xs" style={{ color: "#6B7280" }}>Página {pagSkuAtual} de {totalPagSku}</span>
                  <button onClick={() => setPagSku(pagSkuAtual + 1)} disabled={pagSkuAtual >= totalPagSku}
                    className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
                    style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>Próxima →</button>
                </div>
              </div>
              <p className="text-[11px] mt-3" style={{ color: "#9CA3AF" }}>Lucro por item = receita − custo (ficha técnica) − taxas do marketplace − imposto. Respeita os filtros acima (empresa, marketplace, situação, período). ⚠ = SKU sem cadastro no catálogo (custo/taxas podem ficar incompletos).</p>
            </div>
          </>
        )
      )}
    </div>
  );
}

// ============ RH (colaboradores por setor -> alimenta Fabricas) ============
function RH({ fabricas, setFab }) {
  const laser = fabricas.find((f) => f.id === "laser");
  const router = fabricas.find((f) => f.id === "router");
  const setores = [
    laser && { key: "laser", nome: "LASER", lista: laser.colaboradores || [], salvar: (l) => setFab("laser", { colaboradores: l }) },
    router && { key: "router", nome: "ROUTER", lista: router.colaboradores || [], salvar: (l) => setFab("router", { colaboradores: l }) },
    router && router.montagem && { key: "cilindro", nome: "Montagem (Cilindro)", lista: router.montagem.colaboradores || [], salvar: (l) => setFab("router", { montagem: { ...router.montagem, colaboradores: l } }) },
  ].filter(Boolean);

  const recalc = (c) => ({ ...c, total: num(c.salario) + num(c.encargos) + num(c.bonus) });
  const totalGeral = setores.reduce((s, st) => s + st.lista.reduce((a, c) => a + num(c.total), 0), 0);
  const headcount = setores.reduce((s, st) => s + st.lista.length, 0);

  const card = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };
  const mi = "w-full px-2 py-1 rounded border text-sm";
  const ms = { borderColor: "#E5E7EB", background: "#FFFFFF" };

  return (
    <div className="space-y-5">
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
        Colaboradores por setor. O total de cada setor alimenta automaticamente os custos da aba <strong>Fabricas</strong> (linha "Total Colaboradores" e o custo de montagem). O <strong>Total</strong> de cada pessoa e salario + encargos + bonus.
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Folha total (mes)</p><p className="text-lg font-semibold">{BRL(totalGeral)}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Colaboradores</p><p className="text-lg font-semibold">{headcount}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Setores</p><p className="text-lg font-semibold">{setores.length}</p></div>
      </div>
      {setores.map((st) => {
        const totSetor = st.lista.reduce((a, c) => a + num(c.total), 0);
        return (
          <div key={st.key} style={card}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{st.nome}</h3>
              <p className="text-sm" style={{ color: "#6B7280" }}>{st.lista.length} pessoa(s) · <strong>{BRL(totSetor)}</strong>/mes</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 680 }}>
                <thead>
                  <tr style={{ color: "#6B7280", textAlign: "left" }}>
                    <th className="px-2 py-2">Nome</th><th className="px-2 py-2">Cargo</th>
                    <th className="px-2 py-2 text-right">Salario</th><th className="px-2 py-2 text-right">Encargos</th>
                    <th className="px-2 py-2 text-right">Bonus</th><th className="px-2 py-2 text-right">Total</th><th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {st.lista.map((c) => (
                    <tr key={c.id} style={{ borderTop: "1px solid #EEF0F2" }}>
                      <td className="px-2 py-1"><input className={mi} style={ms} value={c.nome || ""}
                        onChange={(e) => st.salvar(st.lista.map((x) => x.id === c.id ? { ...x, nome: e.target.value } : x))} /></td>
                      <td className="px-2 py-1"><input className={mi} style={ms} value={c.cargo || ""}
                        onChange={(e) => st.salvar(st.lista.map((x) => x.id === c.id ? { ...x, cargo: e.target.value } : x))} /></td>
                      {["salario", "encargos", "bonus"].map((campo) => (
                        <td key={campo} className="px-2 py-1"><input type="number" step="any" className={mi + " text-right"} style={ms} value={c[campo]}
                          onChange={(e) => st.salvar(st.lista.map((x) => x.id === c.id ? recalc({ ...x, [campo]: e.target.value }) : x))} /></td>
                      ))}
                      <td className="px-2 py-1 text-right font-semibold">{BRL(num(c.total))}</td>
                      <td className="px-2 py-1 text-right"><button className="text-lg" style={{ color: "#A33B2E" }}
                        onClick={() => st.salvar(st.lista.filter((x) => x.id !== c.id))}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-3 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#1F2937", background: "#EEF2F7" }}
              onClick={() => st.salvar([...st.lista, { id: uid(), nome: "Novo colaborador", cargo: "", salario: 0, encargos: 0, bonus: 0, total: 0 }])}>
              + Adicionar colaborador
            </button>
          </div>
        );
      })}
    </div>
  );
}


// ============ RELATORIOS (consumo de materia-prima por fornecedor) ============
function Relatorios({ produtos, insumos, fornecedores }) {
  const [periodo, setPeriodo] = useState("semana");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const isoD = (d) => d.toISOString().slice(0, 10);
  function intervalo() {
    const hoje = new Date();
    if (periodo === "mes") {
      const y = hoje.getFullYear(), m = hoje.getMonth();
      return { ini: isoD(new Date(y, m - 1, 1)), fim: isoD(new Date(y, m, 0)) };
    }
    if (periodo === "custom") return { ini: dataIni, fim: dataFim };
    return { ini: isoD(new Date(hoje.getTime() - 7 * 86400000)), fim: isoD(hoje) };
  }

  async function carregar() {
    setCarregando(true); setErro("");
    const { ini, fim } = intervalo();
    let q = supabase.from("vendas").select("*").limit(5000);
    if (ini) q = q.gte("data_pedido", ini);
    if (fim) q = q.lte("data_pedido", fim);
    const { data, error } = await q;
    if (error) setErro(error.message); else setVendas(data || []);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  // Explosão de materia-prima considera SOMENTE pedidos JÁ ENVIADOS
  // (o material só é consumido quando o produto é produzido/despachado, não ao pagar).
  // "Entregue" também conta, pois foi necessariamente enviado antes; exclui cancelado/devolvido.
  function ehEnviado(sit) {
    const t = String(sit || "").toLowerCase();
    if (t.includes("cancel") || t.includes("devolv")) return false;
    return t.includes("envi") || t.includes("entreg");
  }

  const linhas = useMemo(() => {
    const agg = {};
    for (const v of vendas) {
      if (!ehEnviado(v.situacao)) continue;
      for (const it of v.itens || []) {
        const prod = casarSku(it.sku, produtos);
        if (!prod || !(prod.itens || []).length) continue;
        const emp = prod.empresa || empresaDoSku(prod.sku);
        const vendidas = num(it.quantidade);
        for (const f of prod.itens) {
          const ins = insumos.find((i) => i.id === f.insumoId);
          if (!ins || !ins.fornecedorId) continue;
          const qty = num(f.qtd) * vendidas;
          const custo = custoUnit(ins) * qty;
          const k = emp + "|" + ins.fornecedorId + "|" + ins.id;
          if (!agg[k]) agg[k] = { empresa: emp, fornecedorId: ins.fornecedorId, ins, qty: 0, custo: 0 };
          agg[k].qty += qty; agg[k].custo += custo;
        }
      }
    }
    const fn = (id) => (fornecedores.find((f) => f.id === id) || {}).nome || id;
    return Object.values(agg).map((a) => ({
      empresa: a.empresa, fornecedor: fn(a.fornecedorId),
      codigo: a.ins.codigo || "", insumo: a.ins.descricao || "", unidade: a.ins.unidUso || "",
      quantidade: a.qty, custo: a.custo,
    })).sort((x, y) => x.empresa.localeCompare(y.empresa) || x.fornecedor.localeCompare(y.fornecedor) || y.custo - x.custo);
  }, [vendas, produtos, insumos, fornecedores]);

  const totLaser = linhas.filter((l) => l.empresa === "LASER").reduce((s, l) => s + l.custo, 0);
  const totRouter = linhas.filter((l) => l.empresa === "ROUTER").reduce((s, l) => s + l.custo, 0);

  async function baixarExcel() {
    const XLSX = await import("xlsx");
    const rows = linhas.map((l) => ({
      Empresa: l.empresa, Fornecedor: l.fornecedor, "Codigo": l.codigo, Insumo: l.insumo,
      Unidade: l.unidade, Quantidade: Math.round(l.quantidade * 1000) / 1000, "Custo (R$)": Math.round(l.custo * 100) / 100,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materia-prima");
    const { ini, fim } = intervalo();
    XLSX.writeFile(wb, "materia-prima_" + ini + "_a_" + fim + ".xlsx");
  }

  const card = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };
  const ctrl = { borderColor: "#E5E7EB", background: "#FFFFFF" };
  const iv = intervalo();

  return (
    <div className="space-y-5">
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
        Consumo TEORICO de materia-prima no periodo (explode cada produto na ficha tecnica), por fornecedor e insumo, separado por empresa. Considera apenas pedidos JA ENVIADOS (inclui entregues; ignora cancelados/devolvidos).
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs" style={{ color: "#6B7280" }}>Periodo
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl}>
            <option value="semana">Ultimos 7 dias</option>
            <option value="mes">Mes anterior (fechado)</option>
            <option value="custom">Personalizado</option>
          </select>
        </label>
        {periodo === "custom" && (
          <>
            <label className="text-xs" style={{ color: "#6B7280" }}>De
              <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl} />
            </label>
            <label className="text-xs" style={{ color: "#6B7280" }}>Ate
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl} />
            </label>
          </>
        )}
        <button onClick={carregar} className="px-3 py-2 rounded-lg text-sm" style={{ background: "#1F2937", color: "#F4F5F7" }}>Atualizar</button>
        <button onClick={baixarExcel} disabled={!linhas.length} className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50" style={{ color: "#1F2937", borderColor: "#E5E7EB" }}>Baixar Excel</button>
        <span className="text-xs" style={{ color: "#9CA3AF" }}>{iv.ini} a {iv.fim}</span>
      </div>

      {erro && <p className="text-sm" style={{ color: "#DC2626" }}>Erro: {erro}</p>}

      <div className="grid grid-cols-3 gap-3">
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Total materia-prima</p><p className="text-lg font-semibold">{BRL(totLaser + totRouter)}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>LASER</p><p className="text-lg font-semibold">{BRL(totLaser)}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>ROUTER</p><p className="text-lg font-semibold">{BRL(totRouter)}</p></div>
      </div>

      {carregando ? (
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Calculando...</p>
      ) : !linhas.length ? (
        <div style={card}><p className="text-sm" style={{ color: "#6B7280" }}>Sem consumo no periodo.</p></div>
      ) : (
        <div className="overflow-x-auto" style={card}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "#9CA3AF", textAlign: "left" }}>
                <th className="py-2 pr-3">Empresa</th><th className="py-2 pr-3">Fornecedor</th>
                <th className="py-2 pr-3">Insumo</th><th className="py-2 pr-3 text-right">Quantidade</th>
                <th className="py-2 pr-3 text-right">Custo</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => (
                <tr key={i} style={{ borderTop: "1px solid #EEF0F2" }}>
                  <td className="py-2 pr-3"><span className="px-2 py-0.5 rounded text-[11px]" style={{ background: l.empresa === "ROUTER" ? "#EFF6FF" : "#F1F5F9", color: "#374151" }}>{l.empresa}</span></td>
                  <td className="py-2 pr-3">{l.fornecedor}</td>
                  <td className="py-2 pr-3">{l.codigo ? l.codigo + " — " : ""}{l.insumo}</td>
                  <td className="py-2 pr-3 text-right">{(Math.round(l.quantidade * 1000) / 1000).toLocaleString("pt-BR")} {l.unidade}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{BRL(l.custo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ============ CLIENTES (dados de contato a partir das vendas do Tiny) ============
function Clientes() {
  const [periodo, setPeriodo] = useState("tudo");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [pagCli, setPagCli] = useState(1);
  const POR_PAGINA = 50;

  const isoD = (d) => d.toISOString().slice(0, 10);
  function intervalo() {
    const hoje = new Date();
    if (periodo === "semana") return { ini: isoD(new Date(hoje.getTime() - 7 * 86400000)), fim: isoD(hoje) };
    if (periodo === "mes") { const y = hoje.getFullYear(), m = hoje.getMonth(); return { ini: isoD(new Date(y, m - 1, 1)), fim: isoD(new Date(y, m, 0)) }; }
    if (periodo === "custom") return { ini: dataIni, fim: dataFim };
    return { ini: "", fim: "" };
  }

  async function carregar() {
    setCarregando(true); setErro("");
    const { ini, fim } = intervalo();
    let q = supabase.from("vendas").select("cliente_nome,valor_total,data_pedido,payload_raw").order("data_pedido", { ascending: false }).limit(5000);
    if (ini) q = q.gte("data_pedido", ini);
    if (fim) q = q.lte("data_pedido", fim);
    const { data, error } = await q;
    if (error) setErro(error.message); else setVendas(data || []);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  function dados(v) {
    const c = (v.payload_raw && v.payload_raw.cliente) || {};
    const ent = (v.payload_raw && v.payload_raw.endereco_entrega) || {};
    return {
      nome: c.nome || v.cliente_nome || "",
      telefone: c.fone || ent.fone || "",
      cidade: c.cidade || ent.cidade || "",
      uf: c.uf || ent.uf || "",
      email: c.email || "",
      cpf: c.cpf_cnpj || "",
    };
  }

  const clientes = useMemo(() => {
    const map = {};
    for (const v of vendas) {
      const d = dados(v);
      const key = String(d.telefone || d.cpf || (d.nome + "|" + d.cidade)).trim().toLowerCase();
      if (!key || key === "|") continue;
      if (!map[key]) map[key] = { ...d, pedidos: 0, total: 0, ultima: "" };
      map[key].pedidos += 1;
      map[key].total += num(v.valor_total);
      const dt = String(v.data_pedido || "");
      if (dt > map[key].ultima) map[key].ultima = dt;
      for (const f of ["nome", "telefone", "cidade", "uf", "email"]) if (!map[key][f] && d[f]) map[key][f] = d[f];
    }
    let lista = Object.values(map);
    const qq = busca.trim().toLowerCase();
    if (qq) lista = lista.filter((c) => (c.nome + " " + c.telefone + " " + c.cidade + " " + c.email).toLowerCase().includes(qq));
    return lista.sort((a, b) => String(b.ultima).localeCompare(String(a.ultima)));
  }, [vendas, busca]);

  useEffect(() => { setPagCli(1); }, [busca, periodo, dataIni, dataFim, vendas.length]);
  const totalPagCli = Math.max(1, Math.ceil(clientes.length / POR_PAGINA));
  const pagCliAtual = Math.min(pagCli, totalPagCli);
  const clientesPagina = clientes.slice((pagCliAtual - 1) * POR_PAGINA, pagCliAtual * POR_PAGINA);

  async function baixarExcel() {
    const XLSX = await import("xlsx");
    const rows = clientes.map((c) => ({
      Nome: c.nome, Telefone: c.telefone, Cidade: c.cidade, UF: c.uf, "E-mail": c.email,
      Pedidos: c.pedidos, "Total (R$)": Math.round(c.total * 100) / 100, "Ultima compra": c.ultima,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    XLSX.writeFile(wb, "clientes.xlsx");
  }

  const card = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };
  const ctrl = { borderColor: "#E5E7EB", background: "#FFFFFF" };

  return (
    <div className="space-y-5">
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
        Clientes que compraram, montados a partir dos pedidos do Tiny. Campos disponiveis: nome, telefone, cidade/UF e e-mail (sexo e idade nao vem nos pedidos). Use para conhecer seu publico e, no futuro, disparos de mensagens.
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs" style={{ color: "#6B7280" }}>Periodo
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl}>
            <option value="tudo">Tudo</option>
            <option value="semana">Ultimos 7 dias</option>
            <option value="mes">Mes anterior</option>
            <option value="custom">Personalizado</option>
          </select>
        </label>
        {periodo === "custom" && (
          <>
            <label className="text-xs" style={{ color: "#6B7280" }}>De
              <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl} />
            </label>
            <label className="text-xs" style={{ color: "#6B7280" }}>Ate
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl} />
            </label>
          </>
        )}
        <label className="text-xs flex-1 min-w-[180px]" style={{ color: "#6B7280" }}>Buscar
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, cidade, telefone..." className="block w-full px-2 py-2 rounded-lg border text-sm" style={ctrl} />
        </label>
        <button onClick={carregar} className="px-3 py-2 rounded-lg text-sm" style={{ background: "#1F2937", color: "#F4F5F7" }}>Atualizar</button>
        <button onClick={baixarExcel} disabled={!clientes.length} className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50" style={{ color: "#1F2937", borderColor: "#E5E7EB" }}>Baixar Excel</button>
      </div>

      {erro && <p className="text-sm" style={{ color: "#DC2626" }}>Erro: {erro}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Clientes</p><p className="text-lg font-semibold">{clientes.length}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Com telefone</p><p className="text-lg font-semibold">{clientes.filter((c) => c.telefone).length}</p></div>
        <div style={card}><p className="text-xs" style={{ color: "#9CA3AF" }}>Com e-mail</p><p className="text-lg font-semibold">{clientes.filter((c) => c.email).length}</p></div>
      </div>

      {carregando ? (
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Carregando...</p>
      ) : !clientes.length ? (
        <div style={card}><p className="text-sm" style={{ color: "#6B7280" }}>Nenhum cliente no periodo.</p></div>
      ) : (
        <div className="overflow-x-auto" style={card}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "#9CA3AF", textAlign: "left" }}>
                <th className="py-2 pr-3">Nome</th><th className="py-2 pr-3">Telefone</th>
                <th className="py-2 pr-3">Cidade/UF</th><th className="py-2 pr-3">E-mail</th>
                <th className="py-2 pr-3 text-right">Pedidos</th><th className="py-2 pr-3 text-right">Total</th><th className="py-2 pr-3">Ultima</th>
              </tr>
            </thead>
            <tbody>
              {clientesPagina.map((c, i) => (
                <tr key={i} style={{ borderTop: "1px solid #EEF0F2" }}>
                  <td className="py-2 pr-3">{c.nome || "—"}</td>
                  <td className="py-2 pr-3">{c.telefone || "—"}</td>
                  <td className="py-2 pr-3">{c.cidade}{c.uf ? "/" + c.uf : ""}</td>
                  <td className="py-2 pr-3">{c.email || "—"}</td>
                  <td className="py-2 pr-3 text-right">{c.pedidos}</td>
                  <td className="py-2 pr-3 text-right">{BRL(c.total)}</td>
                  <td className="py-2 pr-3">{fmtData(c.ultima)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              Mostrando {(pagCliAtual - 1) * POR_PAGINA + 1}–{Math.min(pagCliAtual * POR_PAGINA, clientes.length)} de {clientes.length}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagCli(pagCliAtual - 1)} disabled={pagCliAtual <= 1}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
                style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>← Anterior</button>
              <span className="text-xs" style={{ color: "#6B7280" }}>Página {pagCliAtual} de {totalPagCli}</span>
              <button onClick={() => setPagCli(pagCliAtual + 1)} disabled={pagCliAtual >= totalPagCli}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
                style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>Próxima →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ============ CONTROLE DE ACESSO (por setor) ============
function abasDoSetor(setor) {
  const TODAS = ["produtos", "tempo-real", "financeiro", "relatorios", "estoque", "insumos", "fornecedores", "fabricas", "rh", "marketplaces", "usuarios", "ajuda"];
  if (setor === "dono") return TODAS;
  if (setor === "financeiro") return TODAS.filter((t) => t !== "usuarios");
  if (setor === "rh") return ["rh", "ajuda"];
  if (setor === "vendas") return ["produtos", "marketplaces", "ajuda"];
  return ["ajuda"]; // restrito ou carregando
}

function Usuarios() {
  const [lista, setLista] = useState([]);
  const [email, setEmail] = useState("");
  const [setor, setSetor] = useState("vendas");
  const [erro, setErro] = useState("");

  const SETORES = [
    ["dono", "Dono (tudo + gerenciar usuários)"],
    ["financeiro", "Financeiro (todas as abas de dados)"],
    ["rh", "RH (somente aba RH)"],
    ["vendas", "Vendas (Produtos: só margem/imposto + Marketplaces)"],
    ["restrito", "Restrito (sem acesso)"],
  ];
  const nomeSetor = (s) => (SETORES.find((x) => x[0] === s) || [s, s])[1];

  async function carregar() {
    const { data, error } = await supabase.from("perfis").select("*").order("email");
    if (error) setErro(error.message); else { setLista(data || []); setErro(""); }
  }
  useEffect(() => { carregar(); }, []);

  async function salvar() {
    const e = email.trim().toLowerCase();
    if (!e) return;
    const { error } = await supabase.from("perfis").upsert({ email: e, setor });
    if (error) { setErro(error.message); return; }
    setEmail(""); carregar();
  }
  async function alterar(em, novo) { await supabase.from("perfis").update({ setor: novo }).eq("email", em); carregar(); }
  async function remover(em) { await supabase.from("perfis").delete().eq("email", em); carregar(); }

  const card = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };
  const ctrl = { borderColor: "#E5E7EB", background: "#FFFFFF" };

  return (
    <div className="space-y-5">
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
        Defina o setor de cada pessoa. O login em si é criado no Supabase (Authentication); aqui você só liga o <strong>e-mail</strong> ao <strong>setor</strong>, que controla quais abas a pessoa vê. (Trava de interface — organiza acessos do dia a dia.)
      </div>

      <div style={card}>
        <p className="text-sm font-semibold mb-3">Adicionar / atualizar acesso</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs flex-1 min-w-[220px]" style={{ color: "#6B7280" }}>E-mail da pessoa
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pessoa@email.com" className="block w-full px-2 py-2 rounded-lg border text-sm" style={ctrl} />
          </label>
          <label className="text-xs" style={{ color: "#6B7280" }}>Setor
            <select value={setor} onChange={(e) => setSetor(e.target.value)} className="block px-2 py-2 rounded-lg border text-sm" style={ctrl}>
              {SETORES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <button onClick={salvar} className="px-3 py-2 rounded-lg text-sm" style={{ background: "#1F2937", color: "#F4F5F7" }}>Salvar</button>
        </div>
        {erro && <p className="text-sm mt-2" style={{ color: "#DC2626" }}>Erro: {erro}</p>}
      </div>

      <div className="overflow-x-auto" style={card}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "#9CA3AF", textAlign: "left" }}>
              <th className="py-2 pr-3">E-mail</th><th className="py-2 pr-3">Setor</th><th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.email} style={{ borderTop: "1px solid #EEF0F2" }}>
                <td className="py-2 pr-3">{u.email}</td>
                <td className="py-2 pr-3">
                  <select value={u.setor} onChange={(e) => alterar(u.email, e.target.value)} className="px-2 py-1 rounded border text-sm" style={ctrl} title={nomeSetor(u.setor)}>
                    {SETORES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td className="py-2 pr-3 text-right">
                  <button onClick={() => remover(u.email)} className="text-lg" style={{ color: "#A33B2E" }} title="Remover">×</button>
                </td>
              </tr>
            ))}
            {!lista.length && <tr><td colSpan={3} className="py-3" style={{ color: "#6B7280" }}>Nenhum acesso definido ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
