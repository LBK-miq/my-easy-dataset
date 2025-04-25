/**
 * 问题生成 Prompt 模板
 * @param {*} text 待处理文本
 * @param {*} number 摘要与总字数的比值
 * @param {*} min 最短长度
 * @param {*} max 最长长度
 */
module.exports = function splitTextPrompt({
    text,
    min = 1000,
    max = 2000,
    number = 300,
    language = '中文',
    globalPrompt = '',
    splitPrompt = ''
  }) {
    //  试下段落数约束会不会更有效
    const minSplitNum = text.length > max ? parseInt(text.length / max) : 1;
    const maxSplitNum = Math.ceil(text.length / min)
    if (globalPrompt) {
      globalPrompt = `在后续的任务中，你务必遵循这样的规则：${globalPrompt}`;
    }
    if (splitPrompt) {
        splitPrompt = `- 在对文本分段时，你务必遵循这样的规则：${splitPrompt}`;
    }
    return `
      # 角色使命
      你是一位专业的文本分析专家，擅长根据语义对复杂文本进行切分操作。
      ${globalPrompt}
  
      ## 核心任务
      根据用户提供的Markdown格式文本（长度：${text.length} 字），按照文本语义将其切分为${minSplitNum}到${maxSplitNum}段，给出相应的语义分段点（point），并按照要求给出如下信息：
      - 提供一个主题（topic），描述该段的主要内容及在文档中的意义
      - 提供一个分点摘要（abstract），以数组形式摘录该段文本中含知识点的语段。
  
      ## 约束条件（重要！）
      - 必须基于文本内容直接生成
      - 语义分段点（point）要求输出分段最末尾的完整的一句话，必须完全符合原文、保留所有字符
      - 最后一段的语义分段点必须是文本最后一句话，即最后一段必须包括文本末尾
      - 各分段长度应尽可能均匀，控制在${min}到${max}字之间
      - 主题（topic）需说明分段包含的内容，要求简练且全面（50字以内），完全尊重原文、上下文及标题含义
      - 分点摘要（abstract）要求摘取文本原文，必须完全符合原文、保留所有字符，不应添加其他描述性语句；原文必须表述唯一一个完整的知识，不要摘取不含知识点的文句（如单独的词组、姓名等），不要分开一个完整的知识点
      - 每个分段分点摘要数量不固定，分段越长条目应越多，平均每${number}字摘取1条
      - 不要分开上下文有较强关联的文段、句子
      ${splitPrompt}
  
      ## 处理流程
      1. 【文本解析】处理输入文本，识别文本不同段落的语义差异
      2. 【分段生成】基于语义对文本进行分段，并总结每段主题
      3. 【质量检查】确保：
         - 分段及该段主题可在原文中找到依据
         - 主题与该分段内容强相关
         - 无格式错误
      
      ## 输出格式
      - 必须按照规定的 JSON 格式输出，不要输出任何其他不相关内容
      - JSON 数组及字典格式必须正确
      - 字段名使用英文双引号
      - 输出的 JSON 数组必须严格符合以下结构：
      \`\`\`json
      [{"point": "分段1的最后一句", "topic": "分段1的主题", "abstract": ["分段1知识点原文1", "分段1知识点原文2"]}, {"point": "分段2的最后一句", "topic": "分段2的主题", "abstract": ["分段2知识点原文1"]}]
      \`\`\`
  
      ## 待处理文本
      ${text}

      `;
  };
  