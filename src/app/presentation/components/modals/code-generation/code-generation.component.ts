import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-generation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
        <div class="text-center">
          <!-- Loading spinner -->
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div class="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"
                   style="animation-direction: reverse; animation-duration: 1.5s;"></div>
            </div>
          </div>

          <!-- Title -->
          <h2 class="text-2xl font-bold text-gray-800 mb-3">
            🚀 Generando Código
          </h2>

          <!-- Project name -->
          <p class="text-lg font-medium text-blue-600 mb-4">
            {{ projectName }}
          </p>

          <!-- Description -->
          <p class="text-gray-600 leading-relaxed">
            Estamos generando el código de tu proyecto. Este proceso puede tomar unos momentos.
          </p>

          <!-- Progress indicator -->
          <div class="mt-6">
            <div class="flex justify-center space-x-1 mb-3">
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
            </div>

            <!-- Success message -->
            <p class="text-sm text-green-600 font-medium">
              ✅ La descarga comenzará automáticamente cuando esté listo
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    .animate-bounce {
      animation: bounce 1.4s infinite ease-in-out both;
    }
  `]
})
export class CodeGenerationComponent {
  @Input() projectName: string = '';
}
