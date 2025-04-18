/**
 * Markdown文本分割工具主模块
 */

const parser = require('./core/parser');
const splitter = require('./core/splitter');
const summary = require('./core/summary');
const formatter = require('./output/formatter');
const fileWriter = require('./output/fileWriter');
const toc = require('./core/toc');

/**
 * 拆分Markdown文档
 * @param {string} markdownText - Markdown文本
 * @param {number} minSplitLength - 最小分割字数
 * @param {number} maxSplitLength - 最大分割字数
 * @returns {Array} - 分割结果数组
 */
function splitMarkdown(markdownText, minSplitLength, maxSplitLength) {
  console.log(markdownText)

  // 解析文档结构
  const outline = parser.extractOutline(markdownText);

  // 按标题分割文档
  const sections = parser.splitByHeadings(markdownText, outline);

  // 处理段落，确保满足分割条件
  const res = splitter.processSections(sections, outline, minSplitLength, maxSplitLength);

  return res.map(r => ({
    result: `> **📑 Summarization：** *${r.summary}*\n\n---\n\n${r.content}`,
    ...r
  }));
}

/**
 * 大模型语义拆分Markdown文档
 * @param {string} markdownText - Markdown文本
 * @param {string} LLMResponse - 大模型返回结果
 * @returns {Array} - 分割结果数组
 */
function splitMarkdownWithLLM(markdownText, LLMResponse) {
  
  var waitingText = markdownText;
  var res = []

  try { 
    for (let i = 0; i < LLMResponse.length; i++) {
      var splitTexts;
      const pointList = [LLMResponse[i]['point'], LLMResponse[i]['point'].replace('.', '\\.').replace('_', "\\_"),
      LLMResponse[i]['point'].replace('.', '\\.').replace('_', "\\_").replace(' ', '')];
      for (let i = 0; i < pointList.length; i++) {
        splitTexts = waitingText.split(pointList[i]);
        if (splitTexts.length > 1) break;
      }
      if (splitTexts.length == 1) {
        console.log(`分段异常，找不到分段点：${LLMResponse[i]['point']}`);
        continue;
      }
      res.push({summary: LLMResponse[i]['topic'], content: splitTexts[0] + LLMResponse[i]['point']});
      waitingText = '';
      for (let j = 1; j < splitTexts.length; j++) {
        waitingText += splitTexts[j];
      }
    }
    res.push({summary: '全文内容', content: markdownText});
  } catch (error) {
    console.error('Text split error:', error);
  }
  return res.map(r => ({
    result: `> **📑 Summarization：** *${r.summary}*\n\n---\n\n${r.content}`,
    ...r
  }));
}

// 导出模块功能
module.exports = {
  // 核心功能
  splitMarkdown,
  splitMarkdownWithLLM,
  combineMarkdown: formatter.combineMarkdown,
  saveToSeparateFiles: fileWriter.saveToSeparateFiles,

  // 目录提取功能
  extractTableOfContents: toc.extractTableOfContents,
  tocToMarkdown: toc.tocToMarkdown,

  // 其他导出的子功能
  parser,
  splitter,
  summary,
  formatter,
  fileWriter,
  toc
};
