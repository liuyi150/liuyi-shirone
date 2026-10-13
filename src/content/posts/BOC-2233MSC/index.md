---
title: 哔卡网申和申请进度查询攻略
description: 新的哔卡已经出现
published: 2026-10-12
draft: false
alias: "boc-2233msc/哔卡网申和申请进度查询攻略"
tags:
  - 随笔
category: 生活
---


## 预约、进度查询
🔗 网申预约入口：[“中国银行卡片预约页面”](https://open.boc.cn/bankcard/cardReserve/index.html#/?appId=8AFAF8C546EB63E9AE3202BC13DB46FC&prodId=P260802MYZGWK2025060515073600001&subProdId=JJKYY&funcId=cardIntroduce&chanId=bili_bzapp)  

🔍 进度查询入口： 进入 [预约页面](https://open.boc.cn/bankcard/cardReserve/index.html#/?appId=8AFAF8C546EB63E9AE3202BC13DB46FC&prodId=P260802MYZGWK2025060515073600001&subProdId=JJKYY&funcId=cardIntroduce&chanId=bili_bzapp) 点击底部的 [“申请进度查询”](https://open.boc.cn/bankcard/cardReserve/index.html#/?appId=8AFAF8C546EB63E9AE3202BC13DB46FC&prodId=P260802MYZGWK2025060515073600001&subProdId=JJKYY&funcId=cardIntroduce&chanId=bili_bzapp)

## 高级控制台代码和 JS 脚本
进入申请进度查询页面，输入你的信息查询，点击你要具体查询的卡，按 F12 打开浏览器控制台（Console），直接粘贴输入以下单行表达式，即可实时返回完整卡号与对应制卡状态：
```text
document.getElementsByClassName("progress-result-wrap")[0].__vue__.$parent.recordInfo.cardNo.replace(/\s+/g, '') + " | " + document.getElementsByClassName("progress-result-wrap")[0].__vue__.$parent.recordInfo.mkcrdProgreSts + " (" + ({'00':'待制卡','01':'制卡中','03':'寄送中','04':'待领卡','06':'已领卡','02':'流程异常','05':'流程异常','07':'流程异常'}[document.getElementsByClassName("progress-result-wrap")[0].__vue__.$parent.recordInfo.mkcrdProgreSts] || "未知") + ")"
```
或者你也可以使用我使用 DeepSeek V4.1 Flash 制作的 JS 脚本：
```JavaScript
// ==UserScript==
// @name         中银制卡进度提取
// @namespace    https://viayoo.com/
// @version      1.2.0
// @description  从 open.boc.cn 预约开户进度页读取 Vue recordInfo，输出卡号+状态，并自动枚举其余字段
// @author       lianlian
// @run-at       document-idle
// @noframes
// @match        https://open.boc.cn/bankcard/cardReserve/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  if (window.top !== window.self) return;

  /* ================= 可调参数 ================= */
  const CFG = {
    selector: '.progress-result-wrap',
    autoCopy: false,                   // 首次拿到结果自动复制
    showPanel: true,                   // false = 只往 console 打
    fields: 'auto',                    // 'none' 只卡号+状态 | 'auto' 自动附加全部字段 | 'json' 附完整 JSON
    includeEmpty: false,               // auto 模式是否输出空值字段
    maxValueLen: 80,                   // auto 模式单个值超长截断
    skipKeys: ['cardNo', 'mkcrdProgreSts'], // 已经单独输出了，不再重复
    recheckDelay: 400,
    idleInterval: 1500,
    giveUpAfterMs: 3 * 60 * 1000
  };

  const STS = {
    '00': '待制卡', '01': '制卡中', '03': '寄送中', '04': '待领卡',
    '06': '已领卡', '02': '流程异常', '05': '流程异常', '07': '流程异常'
  };

  const padCode = (c) => {
    const s = String(c == null ? '' : c).trim();
    return /^\d$/.test(s) ? '0' + s : s;
  };

  /* ============ 1. 找元素所属的 Vue 实例 ============ */
  function findVm(elm) {
    if (elm.__vue__) return { v2: elm.__vue__ };
    let p = elm.parentElement, d = 0;
    while (p && d++ < 60) {
      if (p.__vue__) return { v2: p.__vue__ };
      p = p.parentElement;
    }
    if (elm.__vueParentComponent) return { v3: elm.__vueParentComponent };
    p = elm.parentElement; d = 0;
    while (p && d++ < 60) {
      if (p.__vueParentComponent) return { v3: p.__vueParentComponent };
      p = p.parentElement;
    }
    return null;
  }

  /* ============ 2. 取 recordInfo ============ */
  const pickInfo = (o) => !o ? null :
    o.recordInfo || (o.$data && o.$data.recordInfo) || (o.$props && o.$props.recordInfo) || null;

  function infoFromV2(vm) {
    let cur = vm;
    for (let i = 0; i < 8 && cur; i++) {
      const info = pickInfo(cur);
      if (info && info.cardNo) return info;
      cur = cur.$parent;
    }
    return searchV2(vm.$root, 0);
  }
  function searchV2(vm, d) {
    if (!vm || d > 12) return null;
    const info = pickInfo(vm);
    if (info && info.cardNo) return info;
    const kids = vm.$children || [];
    for (let i = 0; i < kids.length; i++) {
      const r = searchV2(kids[i], d + 1);
      if (r) return r;
    }
    return null;
  }
  function infoFromV3(inst) {
    let cur = inst;
    for (let i = 0; i < 8 && cur; i++) {
      const info = pickInfo(cur.ctx || cur.proxy || cur);
      if (info && info.cardNo) return info;
      cur = cur.parent;
    }
    return null;
  }

  /* ============ 3. 自动枚举字段 ============ */
  function dumpKeys(info) {
    const set = new Set(Object.keys(info));
    // 兜底：有些字段是 getter / 挂在 $data 上，不在 Object.keys 里
    try {
      Object.getOwnPropertyNames(info).forEach((k) => set.add(k));
      if (info.$data) Object.keys(info.$data).forEach((k) => set.add(k));
    } catch (e) { /* ignore */ }

    return Array.from(set).filter((k) =>
      k !== '__ob__' &&
      !/^(_|\$)/.test(k) &&                 // 过滤 __ob__ / _isVue / $data 等
      CFG.skipKeys.indexOf(k) === -1 &&
      typeof readVal(info, k) !== 'function'
    );
  }

  function readVal(info, k) {
    try { return info[k]; } catch (e) { return undefined; } // getter 抛错就跳过
  }

  function fmtValue(v, maxLen) {
    let s;
    if (v === null || v === undefined) s = '';
    else if (typeof v === 'object') {
      try { s = JSON.stringify(v); } catch (e) { s = String(v); }
      if (s && s.length > maxLen) s = s.slice(0, maxLen) + '…';
    } else s = String(v);
    return s.replace(/\s+/g, ' ').trim();
  }

  function autoPairs(info) {
    const out = [];
    dumpKeys(info).forEach((k) => {
      const s = fmtValue(readVal(info, k), CFG.maxValueLen);
      if (!s && !CFG.includeEmpty) return;
      out.push(k + ':' + (s || '-'));
    });
    return out;
  }

  /* ============ 4. 扫描 + 格式化 ============ */
  function formatOne(info) {
    const cardNo = String(info.cardNo).replace(/\s+/g, '');
    const raw = info.mkcrdProgreSts;
    const text = STS[padCode(raw)] || '未知';
    let line = cardNo + ' | ' + raw + ' (' + text + ')';

    if (CFG.fields === 'json') {
      let j;
      try { j = JSON.stringify(info); } catch (e) { j = String(info); }
      return line + ' | ' + j;
    }
    if (CFG.fields === 'auto') {
      autoPairs(info).forEach((p) => { line += ' | ' + p; });
    }
    return line;
  }

  function scan() {
    const wraps = document.querySelectorAll(CFG.selector);
    const lines = [], infos = [];
    for (let i = 0; i < wraps.length; i++) {
      const vm = findVm(wraps[i]);
      if (!vm) continue;
      const info = vm.v2 ? infoFromV2(vm.v2) : infoFromV3(vm.v3);
      if (!info || !info.cardNo) continue;
      lines.push(formatOne(info));
      infos.push(info);
    }
    // 去重（保留首次出现顺序）
    const seen = {}, uLines = [], uInfos = [];
    lines.forEach((l, i) => {
      if (seen[l]) return;
      seen[l] = 1;
      uLines.push(l);
      uInfos.push(infos[i]);
    });
    return { lines: uLines, infos: uInfos };
  }

  /* ============ 5. 复制 ============ */
  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }
  function copy(text) {
    return new Promise((res) => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => res(true), () => res(fallbackCopy(text)));
      } else res(fallbackCopy(text));
    });
  }

  /* ============ 6. 悬浮面板 ============ */
  let panel, titleEl, bodyEl, tipEl, tipTimer, fieldBtn;

  function mkBtn(label, onclick) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = 'all:unset;cursor:pointer;padding:2px 7px;border-radius:6px;' +
      'background:rgba(255,255,255,.12);font-size:12px;line-height:1.5';
    const stop = (e) => e.stopPropagation();
    b.addEventListener('mousedown', stop);
    b.addEventListener('touchstart', stop, { passive: true });
    b.addEventListener('click', (e) => { e.stopPropagation(); onclick(b); });
    return b;
  }

  function flash(msg, ok) {
    if (!tipEl) return;
    tipEl.textContent = msg;
    tipEl.style.color = ok ? '#8fd18f' : '#ff9a9a';
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => { tipEl.textContent = ''; }, 1500);
  }

  const FIELD_LABEL = { none: '简', auto: '全', json: 'JSON' };

  function setFieldMode(mode) {
    CFG.fields = mode;
    fieldBtn.textContent = '字段:' + FIELD_LABEL[mode];
    lastText = '';
    tick();
  }

  function ensurePanel() {
    if (panel || !CFG.showPanel) return;
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;max-width:min(92vw,400px);' +
      'background:rgba(18,20,24,.93);color:#e9eaed;border:1px solid rgba(255,255,255,.16);border-radius:10px;' +
      'font:13px/1.55 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;' +
      'box-shadow:0 8px 28px rgba(0,0,0,.4);overflow:hidden;' +
      '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)';

    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;gap:5px;padding:6px 8px;' +
      'background:rgba(255,255,255,.07);cursor:move;touch-action:none';

    titleEl = document.createElement('div');
    titleEl.textContent = '制卡进度';
    titleEl.style.cssText = 'flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;' +
      'text-overflow:ellipsis;-webkit-user-select:none;user-select:none';

    tipEl = document.createElement('span');
    tipEl.style.cssText = 'font-size:11px;color:#8fd18f;white-space:nowrap';

    fieldBtn = mkBtn('字段:' + FIELD_LABEL[CFG.fields], () => {
      const order = ['none', 'auto', 'json'];
      setFieldMode(order[(order.indexOf(CFG.fields) + 1) % order.length]);
    });

    head.appendChild(titleEl);
    head.appendChild(tipEl);
    head.appendChild(mkBtn('复制', () => copyAll()));
    head.appendChild(fieldBtn);
    head.appendChild(mkBtn('↻', () => { lastText = ''; tick(); }));
    const collapse = mkBtn('－', () => {
      const hidden = bodyEl.style.display === 'none';
      bodyEl.style.display = hidden ? '' : 'none';
      collapse.textContent = hidden ? '－' : '＋';
    });
    head.appendChild(collapse);

    bodyEl = document.createElement('div');
    bodyEl.style.cssText = 'max-height:45vh;overflow:auto;-webkit-overflow-scrolling:touch';

    panel.appendChild(head);
    panel.appendChild(bodyEl);
    document.body.appendChild(panel);

    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    const onDown = (e) => {
      const t = e.touches ? e.touches[0] : e;
      const r = panel.getBoundingClientRect();
      dragging = true; sx = t.clientX; sy = t.clientY; ox = r.left; oy = r.top;
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const t = e.touches ? e.touches[0] : e;
      const x = Math.min(Math.max(0, ox + t.clientX - sx), innerWidth - panel.offsetWidth);
      const y = Math.min(Math.max(0, oy + t.clientY - sy), innerHeight - panel.offsetHeight);
      panel.style.left = x + 'px';
      panel.style.top = y + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      e.preventDefault();
    };
    const onUp = () => { dragging = false; };
    head.addEventListener('mousedown', onDown);
    head.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
  }

  function render(lines) {
    if (!CFG.showPanel) return;
    ensurePanel();
    titleEl.textContent = '制卡进度 · ' + lines.length + ' 条';
    bodyEl.innerHTML = '';
    lines.forEach((line) => {
      const row = document.createElement('div');
      row.textContent = line;
      row.style.cssText = 'padding:6px 9px;border-top:1px solid rgba(255,255,255,.09);' +
        'cursor:pointer;word-break:break-all;-webkit-user-select:text;user-select:text';
      row.addEventListener('click', () => {
        copy(line).then((ok) => flash(ok ? '已复制' : '复制失败', ok));
      });
      bodyEl.appendChild(row);
    });
  }

  function copyAll() {
    if (!lastText) return flash('暂无数据', false);
    copy(lastText).then((ok) => flash(ok ? '已复制全部' : '复制失败', ok));
  }

  /* ============ 7. 调度 ============ */
  let lastText = '', found = false, autoCopied = false, queued = null, lastActive = Date.now(), loggedOnce = false;

  function tick() {
    const res = scan();
    const lines = res.lines;
    if (lines.length) {
      found = true;
      const text = lines.join('\n');
      if (text !== lastText) {
        lastText = text;
        console.log('[制卡进度]\n' + text);
        if (!loggedOnce) {                  // 顺手把原始对象也丢进控制台，方便核对字段
          loggedOnce = true;
          console.log('[制卡进度] 原始 recordInfo:', res.infos);
        }
        render(lines);
        if (CFG.autoCopy && !autoCopied) { autoCopied = true; copy(text); }
      }
    }
  }

  function schedule(delay) {
    if (queued) return;
    queued = setTimeout(() => { queued = null; tick(); }, delay == null ? CFG.recheckDelay : delay);
  }

  const mo = new MutationObserver(() => schedule());

  const boot = () => {
    if (!document.documentElement) return setTimeout(boot, 200);
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    tick();
  };
  boot();

  window.addEventListener('hashchange', () => {
    lastActive = Date.now();
    lastText = '';
    found = false;
    schedule(600);
  });

  const iv = setInterval(() => {
    if (Date.now() - lastActive > CFG.giveUpAfterMs) {
      clearInterval(iv);
      console.log('[制卡进度] 长时间未找到 .progress-result-wrap，已停止轮询。');
      return;
    }
    tick();
  }, CFG.idleInterval);
})();
```