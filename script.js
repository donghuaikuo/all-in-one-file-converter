// 全局变量
let currentTool = null;
let uploadedFile = null;
let conversionInProgress = false;

// 工具配置信息
const toolConfigs = {
    'pdf-to-word': {
        name: 'PDF转Word',
        description: '将PDF文档转换为可编辑的Word格式',
        accept: '.pdf',
        options: [
            { id: 'quality', label: '转换质量', type: 'select', options: ['高', '中', '低'], default: '高' },
            { id: 'layout', label: '保持布局', type: 'checkbox', default: true }
        ]
    },
    'pdf-to-ppt': {
        name: 'PDF转PPT',
        description: '将PDF转换为PowerPoint演示文稿',
        accept: '.pdf',
        options: [
            { id: 'quality', label: '转换质量', type: 'select', options: ['高', '中', '低'], default: '高' }
        ]
    },
    'word-to-pdf': {
        name: 'Word转PDF',
        description: '将Word文档转换为PDF格式',
        accept: '.doc,.docx',
        options: [
            { id: 'compression', label: '压缩级别', type: 'select', options: ['无压缩', '中等压缩', '高压缩'], default: '中等压缩' }
        ]
    },
    'excel-to-pdf': {
        name: 'Excel转PDF',
        description: '将Excel表格转换为PDF格式',
        accept: '.xls,.xlsx',
        options: [
            { id: 'orientation', label: '页面方向', type: 'select', options: ['纵向', '横向'], default: '纵向' }
        ]
    },
    'jpg-to-png': {
        name: 'JPG转PNG',
        description: '将JPG图片转换为PNG格式',
        accept: '.jpg,.jpeg',
        options: [
            { id: 'quality', label: 'PNG质量', type: 'select', options: ['高', '中', '低'], default: '高' }
        ]
    },
    'png-to-jpg': {
        name: 'PNG转JPG',
        description: '将PNG图片转换为JPG格式',
        accept: '.png',
        options: [
            { id: 'quality', label: 'JPG质量', type: 'range', min: 1, max: 100, default: 85 }
        ]
    },
    'webp-to-jpg': {
        name: 'WebP转JPG',
        description: '将WebP图片转换为JPG格式',
        accept: '.webp',
        options: [
            { id: 'quality', label: 'JPG质量', type: 'range', min: 1, max: 100, default: 90 }
        ]
    },
    'heic-to-jpg': {
        name: 'HEIC转JPG',
        description: '将iPhone的HEIC照片转换为JPG格式',
        accept: '.heic,.heif',
        options: [
            { id: 'quality', label: 'JPG质量', type: 'range', min: 1, max: 100, default: 95 }
        ]
    },
    'mp4-to-gif': {
        name: 'MP4转GIF',
        description: '将MP4视频转换为GIF动图',
        accept: '.mp4',
        options: [
            { id: 'fps', label: '帧率', type: 'select', options: ['10fps', '15fps', '24fps'], default: '15fps' },
            { id: 'size', label: '尺寸', type: 'select', options: ['原尺寸', '中等', '小'], default: '中等' }
        ]
    },
    'mov-to-mp4': {
        name: 'MOV转MP4',
        description: '将MOV视频转换为MP4格式',
        accept: '.mov',
        options: [
            { id: 'quality', label: '视频质量', type: 'select', options: ['高', '中', '低'], default: '高' }
        ]
    },
    'video-compress': {
        name: '视频压缩',
        description: '压缩视频文件大小',
        accept: '.mp4,.mov,.avi',
        options: [
            { id: 'compression', label: '压缩级别', type: 'select', options: ['轻度压缩', '中度压缩', '重度压缩'], default: '中度压缩' }
        ]
    },
    'pdf-merge': {
        name: 'PDF合并',
        description: '将多个PDF文件合并为一个',
        accept: '.pdf',
        multiple: true,
        options: [
            { id: 'order', label: '文件顺序', type: 'select', options: ['按文件名', '按上传顺序'], default: '按上传顺序' }
        ]
    },
    'pdf-split': {
        name: 'PDF分割',
        description: '将PDF文件分割为多个文件',
        accept: '.pdf',
        options: [
            { id: 'method', label: '分割方式', type: 'select', options: ['按页数', '按书签'], default: '按页数' },
            { id: 'pages', label: '每份页数', type: 'number', min: 1, max: 50, default: 10 }
        ]
    },
    'image-compress': {
        name: '图片压缩',
        description: '压缩图片文件大小',
        accept: '.jpg,.jpeg,.png,.webp',
        options: [
            { id: 'quality', label: '压缩质量', type: 'range', min: 1, max: 100, default: 80 }
        ]
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeToolSelection();
    initializeFileUpload();
    initializeNavigation();
});

// 初始化工具选择功能
function initializeToolSelection() {
    const toolItems = document.querySelectorAll('.tool-item');
    
    toolItems.forEach(item => {
        item.addEventListener('click', function() {
            const toolId = this.getAttribute('data-tool');
            selectTool(toolId);
        });
    });
}

// 选择工具
function selectTool(toolId) {
    if (!toolConfigs[toolId]) {
        showError('工具配置不存在');
        return;
    }
    
    currentTool = toolId;
    showConverterInterface();
    updateConverterTitle();
    generateToolOptions();
}

// 显示转换器界面
function showConverterInterface() {
    document.getElementById('tools').style.display = 'none';
    document.getElementById('converter').style.display = 'block';
    document.getElementById('upload-area').style.display = 'block';
    document.getElementById('converter-options').style.display = 'none';
    document.getElementById('converter-result').style.display = 'none';
    
    // 重置文件输入
    const fileInput = document.getElementById('file-input');
    fileInput.value = '';
    fileInput.accept = toolConfigs[currentTool].accept;
    if (toolConfigs[currentTool].multiple) {
        fileInput.multiple = true;
    } else {
        fileInput.multiple = false;
    }
    
    uploadedFile = null;
}

// 显示工具选择界面
function showToolSelection() {
    document.getElementById('tools').style.display = 'block';
    document.getElementById('converter').style.display = 'none';
    currentTool = null;
    uploadedFile = null;
}

// 更新转换器标题
function updateConverterTitle() {
    const titleElement = document.getElementById('converter-title');
    const config = toolConfigs[currentTool];
    titleElement.textContent = `${config.name} - ${config.description}`;
}

// 生成工具选项
function generateToolOptions() {
    const optionsContainer = document.getElementById('option-group');
    optionsContainer.innerHTML = '';
    
    const config = toolConfigs[currentTool];
    
    config.options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option-item';
        
        switch (option.type) {
            case 'select':
                optionElement.innerHTML = `
                    <label for="${option.id}">${option.label}:</label>
                    <select id="${option.id}" name="${option.id}">
                        ${option.options.map(opt => 
                            `<option value="${opt}" ${opt === option.default ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                `;
                break;
                
            case 'checkbox':
                optionElement.innerHTML = `
                    <input type="checkbox" id="${option.id}" name="${option.id}" ${option.default ? 'checked' : ''}>
                    <label for="${option.id}">${option.label}</label>
                `;
                break;
                
            case 'range':
                optionElement.innerHTML = `
                    <label for="${option.id}">${option.label}:</label>
                    <input type="range" id="${option.id}" name="${option.id}" 
                           min="${option.min}" max="${option.max}" value="${option.default}">
                    <span id="${option.id}-value">${option.default}</span>
                `;
                
                // 添加范围滑块的值显示
                const rangeInput = optionElement.querySelector('input[type="range"]');
                const valueSpan = optionElement.querySelector(`#${option.id}-value`);
                rangeInput.addEventListener('input', function() {
                    valueSpan.textContent = this.value;
                });
                break;
                
            case 'number':
                optionElement.innerHTML = `
                    <label for="${option.id}">${option.label}:</label>
                    <input type="number" id="${option.id}" name="${option.id}" 
                           min="${option.min}" max="${option.max}" value="${option.default}">
                `;
                break;
        }
        
        optionsContainer.appendChild(optionElement);
    });
}

// 初始化文件上传功能
function initializeFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 文件选择变化
    fileInput.addEventListener('change', function(e) {
        handleFileSelection(e.target.files);
    });
    
    // 拖放功能
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files);
        }
    });
}

// 处理文件选择
function handleFileSelection(files) {
    if (!currentTool) return;
    
    const config = toolConfigs[currentTool];
    
    // 检查文件数量
    if (!config.multiple && files.length > 1) {
        showError('此工具只支持单个文件上传');
        return;
    }
    
    // 检查文件大小（最大50MB）
    const maxSize = 50 * 1024 * 1024; // 50MB
    for (let file of files) {
        if (file.size > maxSize) {
            showError(`文件 "${file.name}" 超过50MB限制`);
            return;
        }
    }
    
    // 检查文件类型
    const acceptedTypes = config.accept.split(',');
    for (let file of files) {
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        if (!acceptedTypes.includes(fileExt)) {
            showError(`文件 "${file.name}" 不是支持的格式：${config.accept}`);
            return;
        }
    }
    
    uploadedFile = files;
    showConversionOptions();
}

// 显示转换选项
function showConversionOptions() {
    document.getElementById('upload-area').style.display = 'none';
    document.getElementById('converter-options').style.display = 'block';
}

// 开始转换
function startConversion() {
    if (!uploadedFile || conversionInProgress) return;
    
    conversionInProgress = true;
    
    // 显示加载状态
    const convertButton = document.querySelector('.convert-button');
    const originalText = convertButton.textContent;
    convertButton.innerHTML = '<span class="loading"></span> 转换中...';
    convertButton.disabled = true;
    
    // 模拟转换过程（实际项目中这里会调用后端API）
    setTimeout(() => {
        conversionInProgress = false;
        showConversionResult();
        convertButton.textContent = originalText;
        convertButton.disabled = false;
    }, 2000);
}

// 显示转换结果
function showConversionResult() {
    document.getElementById('converter-options').style.display = 'none';
    document.getElementById('converter-result').style.display = 'block';
}

// 下载文件
function downloadFile() {
    if (!uploadedFile) return;
    
    // 模拟下载（实际项目中这里会返回转换后的文件）
    const fileName = uploadedFile[0].name.replace(/\.[^/.]+$/, "") + '_converted';
    const fileExtension = getOutputFileExtension();
    
    // 创建虚拟下载链接
    const blob = new Blob(['模拟转换后的文件内容'], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('文件下载开始');
}

// 获取输出文件扩展名
function getOutputFileExtension() {
    const tool = currentTool;
    
    switch (tool) {
        case 'pdf-to-word': return 'docx';
        case 'pdf-to-ppt': return 'pptx';
        case 'word-to-pdf': return 'pdf';
        case 'excel-to-pdf': return 'pdf';
        case 'jpg-to-png': return 'png';
        case 'png-to-jpg': return 'jpg';
        case 'webp-to-jpg': return 'jpg';
        case 'heic-to-jpg': return 'jpg';
        case 'mp4-to-gif': return 'gif';
        case 'mov-to-mp4': return 'mp4';
        case 'video-compress': return uploadedFile[0].name.split('.').pop();
        case 'pdf-merge': return 'pdf';
        case 'pdf-split': return 'zip';
        case 'image-compress': return uploadedFile[0].name.split('.').pop();
        default: return 'converted';
    }
}

// 分享结果
function shareResult() {
    if (navigator.share) {
        navigator.share({
            title: `我在All-in-One转换器完成了${toolConfigs[currentTool].name}`,
            text: `使用All-in-One转换器轻松完成文件格式转换，快来试试吧！`,
            url: window.location.href
        })
        .then(() => showMessage('分享成功'))
        .catch(() => showMessage('分享取消'));
    } else {
        // 复制链接到剪贴板
        const tempInput = document.createElement('input');
        tempInput.value = window.location.href;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showMessage('链接已复制到剪贴板');
    }
}

// 初始化导航
function initializeNavigation() {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 导航栏背景变化
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

// 显示错误消息
function showError(message) {
    // 简单的错误提示实现
    alert(`错误: ${message}`);
}

// 显示成功消息
function showMessage(message) {
    // 简单的消息提示实现
    alert(message);
}

// 工具使用统计（模拟）
function trackToolUsage(toolId) {
    // 实际项目中这里会发送统计信息到后端
    console.log(`工具使用: ${toolId}`);
}

// 文件大小格式化
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}