/**
 * Obsidian North - Main Application Logic
 */

class ObsidianApp {
    constructor() {
        // Interactive app elements
        this.interactiveApp = document.getElementById('interactive-app');
        this.appMessages = document.getElementById('app-messages');
        this.appInput = document.getElementById('app-input');
        this.appSend = document.getElementById('app-send');
        this.appQuickButtons = document.querySelectorAll('.app-quick-btn');
        this.isAppTyping = false;
        this.appEnabled = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.setupCanvas();
    }

    setupEventListeners() {
        // Interactive app event listeners
        this.setupAppEventListeners();
    }

    setupAppEventListeners() {
        // Interactive app chat handlers
        if (this.appSend) {
            this.appSend.addEventListener('click', () => this.sendAppMessage());
        }

        if (this.appInput) {
            this.appInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendAppMessage();
                }
            });
        }

        // Interactive app quick action buttons
        this.appQuickButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-app-prompt');
                if (this.appInput) {
                    this.appInput.value = prompt;
                    this.sendAppMessage();
                }
            });
        });
    }

    getAIResponse(message) {
        // Simple keyword-based responses (replace with actual AI API in production)
        const lowered = message.toLowerCase();

        if (lowered.includes('service') || lowered.includes('what do you')) {
            return `We specialize in three core services:
                <br/><br/>
                <strong>🚀 Custom Web Apps</strong><br/>
                Full-stack applications built with React, Next.js, and Node.js. Perfect for SaaS platforms, dashboards, and e-commerce.
                <br/><br/>
                <strong>🤖 AI Automation</strong><br/>
                Integrate GPT-4, custom AI models, and automation workflows. From chatbots to document processing.
                <br/><br/>
                <strong>💡 Technical Consulting</strong><br/>
                Expert guidance on architecture, performance, and tech stack selection.
                <br/><br/>
                Which area interests you most?`;
        }

        if (lowered.includes('price') || lowered.includes('cost') || lowered.includes('how much')) {
            return `Our pricing depends on your project scope:
                <br/><br/>
                <strong>MVP Projects:</strong> $15K - $30K (4-8 weeks)<br/>
                <strong>Full Applications:</strong> $30K - $80K (8-16 weeks)<br/>
                <strong>AI Integration:</strong> Starting at $10K<br/>
                <strong>Consulting:</strong> $200/hour
                <br/><br/>
                Want a detailed estimate? Let me ask you a few questions about your project, or we can schedule a call to discuss.`;
        }

        if (lowered.includes('ai') && (lowered.includes('automation') || lowered.includes('integration'))) {
            return `We're experts in AI automation! Here's what we can do:
                <br/><br/>
                • <strong>AI Chatbots:</strong> Custom GPT-4 powered assistants for your business<br/>
                • <strong>Document Processing:</strong> Extract, analyze, and automate document workflows<br/>
                • <strong>Workflow Automation:</strong> Connect AI to your existing tools (Slack, email, databases)<br/>
                • <strong>Custom Models:</strong> Fine-tune models for your specific use case
                <br/><br/>
                Most AI projects take 2-6 weeks and start at $10K. Want to discuss your specific needs?`;
        }

        if (lowered.includes('schedule') || lowered.includes('book') || lowered.includes('call') || lowered.includes('consultation')) {
            return `Perfect! I'd love to schedule a call with you.<br/><br/>
                Email us at: <a href="mailto:hello@obsidiannorth.com" style="color: #3b82f6;">hello@obsidiannorth.com</a><br/><br/>
                Or send us your availability and we'll get back to you within 24 hours. Looking forward to chatting! 📅`;
        }

        if (lowered.includes('tech') || lowered.includes('stack') || lowered.includes('technology')) {
            return `We use modern, battle-tested technology:
                <br/><br/>
                <strong>Frontend:</strong> React, Next.js 14, TypeScript, Tailwind CSS<br/>
                <strong>Backend:</strong> Node.js, Python, PostgreSQL, Redis<br/>
                <strong>AI/ML:</strong> OpenAI API, LangChain, Vector databases<br/>
                <strong>DevOps:</strong> Vercel, AWS, Docker, CI/CD
                <br/><br/>
                We choose the right tool for your project - not just what's trendy.`;
        }

        if (lowered.includes('timeline') || lowered.includes('how long') || lowered.includes('time')) {
            return `Typical project timelines:
                <br/><br/>
                <strong>MVP/Prototype:</strong> 4-8 weeks<br/>
                <strong>Full Application:</strong> 8-16 weeks<br/>
                <strong>AI Integration:</strong> 2-6 weeks<br/>
                <strong>Consulting Projects:</strong> 1-4 weeks
                <br/><br/>
                We can work faster if you have tight deadlines - let's discuss your specific timeline!`;
        }

        if (lowered.includes('portfolio') || lowered.includes('examples') || lowered.includes('work')) {
            return `We've built some amazing projects:
                <br/><br/>
                • <strong>AI SaaS Accelerator:</strong> Complete boilerplate that saved clients 6 months of development<br/>
                • <strong>Real-time Analytics Platform:</strong> Processing 50M+ events daily<br/>
                • <strong>E-commerce Optimizer:</strong> Achieved 0.4s load times, 23% conversion lift<br/>
                • <strong>Custom AI Chatbots:</strong> Reduced support tickets by 60%
                <br/><br/>
                Want to see detailed case studies?`;
        }

        // Default response
        return `Great question! I can help you with:
            <br/><br/>
            • Estimating your project cost & timeline<br/>
            • Explaining our services & tech stack<br/>
            • Scheduling a consultation call<br/>
            • Answering technical questions
            <br/><br/>
            What would you like to know more about?`;
    }

    // Interactive App Chat Methods
    async sendAppMessage() {
        if (!this.appEnabled) return; // Only allow messages when app is enabled

        const message = this.appInput.value.trim();
        if (!message || this.isAppTyping) return;

        // Add user message to app
        this.addAppMessage(message, 'user');
        this.appInput.value = '';

        // Show typing indicator
        this.showAppTyping();

        // Simulate AI response
        setTimeout(() => {
            const response = this.getAIResponse(message);
            this.hideAppTyping();
            this.addAppMessage(response, 'bot');
        }, 1500);
    }

    addAppMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;

        messageDiv.appendChild(contentDiv);
        this.appMessages.appendChild(messageDiv);

        // Scroll to bottom
        this.appMessages.scrollTop = this.appMessages.scrollHeight;
    }

    showAppTyping() {
        this.isAppTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'app-typing-indicator';
        typingDiv.innerHTML = '<div class="message-content">●●●</div>';
        this.appMessages.appendChild(typingDiv);
        this.appMessages.scrollTop = this.appMessages.scrollHeight;
    }

    hideAppTyping() {
        this.isAppTyping = false;
        const typing = document.getElementById('app-typing-indicator');
        if (typing) typing.remove();
    }


    setupScrollAnimations() {
        // Continuous scroll-driven animation
        const howItWorksSection = document.getElementById('how-it-works');
        if (!howItWorksSection) return;

        let ticking = false;

        const updateBuildAnimation = () => {
            const rect = howItWorksSection.getBoundingClientRect();
            const sectionHeight = howItWorksSection.offsetHeight;
            const windowHeight = window.innerHeight;

            // Calculate scroll progress (0 to 1)
            // Start when section enters viewport, end when it leaves
            const startOffset = windowHeight * 0.3;
            const scrollStart = -rect.top + startOffset;
            const scrollRange = sectionHeight - windowHeight + startOffset;
            let progress = Math.max(0, Math.min(1, scrollStart / scrollRange));

            this.updateBuildStage(progress);

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateBuildAnimation);
                ticking = true;
            }
        });

        // Initial update
        updateBuildAnimation();
    }

    updateBuildStage(progress) {
        // Get SVG elements
        const gridBg = document.getElementById('grid-bg');
        const wireframeGroup = document.getElementById('wireframe-group');
        const componentsGroup = document.getElementById('components-group');
        const appGroup = document.getElementById('app-group');

        if (!wireframeGroup) return;

        // Simplified stages:
        // 0-0.3: Wireframe draws in
        // 0.3-0.6: Components fill
        // 0.6-0.9: Final polished app
        // 0.9-1.0: Interactive app

        // Stage 1: Wireframe (0-0.3)
        if (progress < 0.3) {
            const wireframeProgress = progress / 0.3;
            if (gridBg) gridBg.setAttribute('opacity', wireframeProgress * 0.3);
            if (wireframeGroup) wireframeGroup.setAttribute('opacity', wireframeProgress);

            // Animate stroke-dashoffset for drawing effect
            const wireframeBoxes = wireframeGroup.querySelectorAll('.wireframe-box');
            wireframeBoxes.forEach(box => {
                const length = box.getAttribute('stroke-dasharray');
                if (length) {
                    const offset = parseFloat(length) * (1 - wireframeProgress);
                    box.setAttribute('stroke-dashoffset', offset);
                }
            });

            const wireframeLines = wireframeGroup.querySelectorAll('.wireframe-line');
            wireframeLines.forEach(line => {
                const length = line.getAttribute('stroke-dasharray');
                if (length) {
                    const offset = parseFloat(length) * (1 - wireframeProgress);
                    line.setAttribute('stroke-dashoffset', offset);
                }
            });

            if (componentsGroup) componentsGroup.setAttribute('opacity', '0');
            if (appGroup) appGroup.setAttribute('opacity', '0');
        }

        // Stage 2: Components (0.3-0.6)
        else if (progress < 0.6) {
            const componentProgress = (progress - 0.3) / 0.3;
            if (gridBg) gridBg.setAttribute('opacity', 0.3 * (1 - componentProgress));
            if (wireframeGroup) wireframeGroup.setAttribute('opacity', 1 - componentProgress);
            if (componentsGroup) componentsGroup.setAttribute('opacity', componentProgress);
            if (appGroup) appGroup.setAttribute('opacity', '0');
        }

        // Stage 3: Final app (0.6-0.9)
        else if (progress < 0.9) {
            const appProgress = (progress - 0.6) / 0.3;
            if (gridBg) gridBg.setAttribute('opacity', '0');
            if (wireframeGroup) wireframeGroup.setAttribute('opacity', '0');
            if (componentsGroup) componentsGroup.setAttribute('opacity', Math.max(0, 1 - appProgress));
            if (appGroup) appGroup.setAttribute('opacity', appProgress);

            // Ensure interactive app is hidden
            if (this.interactiveApp) this.interactiveApp.classList.remove('active');
            this.appEnabled = false;
        }

        // Stage 4: Interactive App (0.9-1.0)
        else {
            if (gridBg) gridBg.setAttribute('opacity', '0');
            if (wireframeGroup) wireframeGroup.setAttribute('opacity', '0');
            if (componentsGroup) componentsGroup.setAttribute('opacity', '0');

            // Fade out SVG app, fade in interactive app
            const appTransition = (progress - 0.9) / 0.1;
            if (appGroup) appGroup.setAttribute('opacity', Math.max(0, 1 - appTransition));

            // Enable interactive app
            if (this.interactiveApp && appTransition > 0.3) {
                this.interactiveApp.classList.add('active');
                this.appEnabled = true;

                // Focus input when fully visible
                if (appTransition > 0.8 && this.appInput && document.activeElement !== this.appInput) {
                    setTimeout(() => {
                        if (document.activeElement === document.body) {
                            this.appInput.focus();
                        }
                    }, 300);
                }
            }
        }
    }

    setupCanvas() {
        // Canvas setup if needed for additional effects
        const canvas = document.getElementById('build-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Optionally add particle effects or background animations here
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ObsidianApp();
});
