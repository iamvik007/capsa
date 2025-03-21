document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const toneSection = document.getElementById('toneSection');
    const toneSelect = document.getElementById('toneSelect');
    const previewSection = document.getElementById('previewSection');
    const imagePreview = document.getElementById('imagePreview');
    const generateBtn = document.getElementById('generateBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const caption = document.getElementById('caption');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const API_KEY = 'AIzaSyCi5M9Q_8k3-8mwsLkTYo_aZptubZAMiFw';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    let currentImage = null;

    // Add hover effect class
    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-indigo-500', 'bg-indigo-50/50');
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-indigo-500', 'bg-indigo-50/50');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    });

    // Click to Upload with ripple effect
    dropZone.addEventListener('click', () => {
        fileInput.click();
        dropZone.classList.add('bg-indigo-50/30');
        setTimeout(() => dropZone.classList.remove('bg-indigo-50/30'), 200);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    });

    function showElement(element) {
        element.classList.remove('hidden');
        // Trigger reflow for animation
        void element.offsetWidth;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    }

    // Handle Image Upload with smooth transitions
    function handleImageUpload(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImage = e.target.result;
                imagePreview.src = currentImage;
                showElement(previewSection);
                showElement(toneSection);
                regenerateBtn.classList.add('hidden');
                caption.textContent = '';
            };
            reader.readAsDataURL(file);
        } else {
            // Show error message with animation
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-red-500 mt-2 animate-bounce';
            errorMsg.textContent = 'Please upload an image file (JPG, PNG, JPEG)';
            dropZone.appendChild(errorMsg);
            setTimeout(() => errorMsg.remove(), 3000);
        }
    }

    // Generate Caption with loading animation
    async function generateCaption() {
        if (!currentImage) return;

        // Disable buttons with visual feedback
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        regenerateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        showElement(loadingIndicator);
        caption.style.opacity = '0.5';

        try {
            const tone = toneSelect.value;
            const imageData = currentImage.split(',')[1];

            const requestData = {
                contents: [{
                    parts: [
                        {
                            text: `Generate a ${tone} tone caption for this image. Be creative and descriptive.`
                        },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageData
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            };

            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error?.message || 'Failed to generate caption');
            }

            const data = await response.json();
            console.log('API Response:', data); // For debugging

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const generatedCaption = data.candidates[0].content.parts[0].text;
                
                // Animate caption appearance
                caption.style.transition = 'all 0.5s ease';
                caption.style.opacity = '0';
                setTimeout(() => {
                    caption.textContent = generatedCaption;
                    caption.style.opacity = '1';
                }, 300);

                regenerateBtn.classList.remove('hidden');
                showElement(regenerateBtn);
            } else {
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            console.error('Error:', error);
            caption.textContent = `Error: ${error.message || 'Failed to generate caption. Please try again.'}`;
            caption.classList.add('text-red-500');
            setTimeout(() => caption.classList.remove('text-red-500'), 3000);
        } finally {
            loadingIndicator.classList.add('hidden');
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            regenerateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // Add button click effects
    function addButtonEffect(button) {
        button.addEventListener('click', function() {
            this.classList.add('scale-95');
            setTimeout(() => this.classList.remove('scale-95'), 200);
        });
    }

    addButtonEffect(generateBtn);
    addButtonEffect(regenerateBtn);

    // Event Listeners for Generate and Regenerate
    generateBtn.addEventListener('click', generateCaption);
    regenerateBtn.addEventListener('click', generateCaption);
});