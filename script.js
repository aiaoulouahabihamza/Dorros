// ===== script.js =====
// كود بسيط ونظيف للتنقل
// في بداية الملف، تأكد من تحميل data.json
let philosophyData = null;

fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        philosophyData = data;
        renderModules(); // دالة عرض المحتوى
    })
    .catch(error => {
        console.log('خطأ في تحميل البيانات:', error);
    });
(function() {
    // عناصر DOM
    const contentDiv = document.getElementById('contentArea');
    const homeBtn = document.getElementById('homeBtn');

    // حالة التطبيق
    let state = {
        currentView: 'modules',
        data: null
    };

    // تحميل البيانات
    async function loadData() {
        try {
            contentDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
            const response = await fetch('data.json');
            state.data = await response.json();
            renderModules();
        } catch (error) {
            contentDiv.innerHTML = '<div class="error">فشل تحميل البيانات</div>';
        }
    }

    // دوال البحث
    function findConceptById(conceptId) {
        for (const module of state.data.modules) {
            const concept = module.concepts.find(c => c.id === conceptId);
            if (concept) return { concept, module };
        }
        return null;
    }

    function findAxisById(axisId) {
        for (const module of state.data.modules) {
            for (const concept of module.concepts) {
                const axis = concept.axes.find(a => a.id === axisId);
                if (axis) return { axis, concept, module };
            }
        }
        return null;
    }

    // عرض المجزوءات
    function renderModules() {
        let html = '<div class="modules-grid">';
        
        state.data.modules.forEach((module, index) => {
            html += `
                <div class="module-card" data-module="${module.id}">
                    <div class="module-icon"><i class="${module.icon}"></i></div>
                    <div class="module-title">${module.title}</div>
                    <div class="module-sub">
                        <i class="fas fa-chevron-down"></i>
                        ${module.concepts.length} مفاهيم
                    </div>
                    <div class="concepts-list" id="concepts-${module.id}"></div>
                </div>
            `;
        });
        
        html += '</div>';
        contentDiv.innerHTML = html;

        // إضافة المفاهيم
        state.data.modules.forEach(module => {
            const conceptsDiv = document.getElementById(`concepts-${module.id}`);
            if (!conceptsDiv) return;

            let conceptsHtml = '';
            module.concepts.forEach(concept => {
                conceptsHtml += `
                    <div class="concept-item" data-concept-id="${concept.id}">
                        <i class="fas fa-cubes"></i>
                        <span>${concept.title}</span>
                        <span class="hint">${concept.axes.length}</span>
                    </div>
                `;
            });
            conceptsDiv.innerHTML = conceptsHtml;

            // حدث النقر على المجزوءة
            const card = document.querySelector(`.module-card[data-module="${module.id}"]`);
            card.addEventListener('click', (e) => {
                if (e.target.closest('.concept-item')) return;
                conceptsDiv.classList.toggle('show');
            });

            // أحداث المفاهيم
            conceptsDiv.querySelectorAll('.concept-item').forEach(item => {
                item.addEventListener('click', () => {
                    showConceptAxes(item.dataset.conceptId);
                });
            });
        });
    }

    // عرض محاور المفهوم
    function showConceptAxes(conceptId) {
        const found = findConceptById(conceptId);
        if (!found) return;

        let html = `
            <div class="axes-header">
                <i class="fas fa-diagram-project"></i>
                <h2>${found.concept.title}</h2>
            </div>
            <div class="axes-grid">
        `;

        found.concept.axes.forEach(axis => {
            html += `
                <div class="axis-card" data-axis-id="${axis.id}">
                    <i class="fas fa-sitemap"></i>
                    <h3>${axis.title}</h3>
                </div>
            `;
        });

        html += '</div>';
        contentDiv.innerHTML = html;

        document.querySelectorAll('.axis-card').forEach(card => {
            card.addEventListener('click', () => {
                showAxisDetail(card.dataset.axisId);
            });
        });
    }

    // عرض تفاصيل المحور
    function showAxisDetail(axisId) {
        const found = findAxisById(axisId);
        if (!found) return;

        // شريط التنقل
        const breadcrumb = `
            <div class="breadcrumb">
                <span class="clickable" data-nav="module">${found.module.title}</span>
                <i class="fas fa-chevron-left"></i>
                <span class="clickable" data-nav="concept" data-concept-id="${found.concept.id}">${found.concept.title}</span>
                <i class="fas fa-chevron-left"></i>
                <span>${found.axis.title}</span>
            </div>
        `;

        // الإشكال
        const problem = `
            <div class="problem-box">
                <h3><i class="fas fa-question-circle"></i> الإشكال</h3>
                <div class="problem-text">${found.axis.problem}</div>
            </div>
        `;

        // المفاهيم
        let concepts = '';
        if (found.axis.concepts && found.axis.concepts.length > 0) {
            concepts = '<div class="concepts-defs"><h3><i class="fas fa-book-open"></i> المفاهيم</h3><div class="def-grid">';
            found.axis.concepts.forEach(c => {
                concepts += `
                    <div class="def-item">
                        <div class="def-term"><i class="fas fa-tag"></i> ${c.term}</div>
                        <div class="def-desc">${c.definition}</div>
                    </div>
                `;
            });
            concepts += '</div></div>';
        }

        // الأطروحات
        let theses = '';
        if (found.axis.theses && found.axis.theses.length > 0) {
            theses = '<div class="theses-box"><h3><i class="fas fa-gavel"></i> الأطروحات</h3>';
            found.axis.theses.forEach(t => {
                theses += `
                    <div class="thesis-card">
                        <div class="thesis-philosopher"><i class="fas fa-quote-right"></i> ${t.philosopher}</div>
                        <div class="thesis-text">${t.text}</div>
                    </div>
                `;
            });
            theses += '</div>';
        }

        contentDiv.innerHTML = breadcrumb + problem + concepts + theses;

        // أحداث التنقل
        document.querySelectorAll('[data-nav="module"]').forEach(el => {
            el.addEventListener('click', renderModules);
        });

        document.querySelectorAll('[data-nav="concept"]').forEach(el => {
            el.addEventListener('click', () => {
                showConceptAxes(el.dataset.conceptId);
            });
        });
    }

    // زر الرئيسية
    homeBtn.addEventListener('click', renderModules);

    // بدء التطبيق
    loadData();
})();
