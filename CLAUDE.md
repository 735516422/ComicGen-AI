# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an image editing application project that provides tools for manipulating, enhancing, and transforming digital images. The project is currently in its initial setup phase.

## Recommended Technology Stack

### Frontend Framework
- **React with TypeScript** - Recommended for component-based UI development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling

### Image Processing Libraries
- **Canvas API** - Native browser API for 2D graphics manipulation
- **Fabric.js** - Powerful canvas library with object model for interactive graphics
- **Sharp** (if using Node.js backend) - High-performance image processing
- **WebGL** - For GPU-accelerated image effects and filters

### File Handling
- **File API** - Native browser file upload/download
- **Exif.js** - For reading image metadata and EXIF data
- **Heic2any** - For HEIC/HEIF format conversion

## Project Structure Guidelines

```
图片编辑/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ImageEditor/     # Core editor components
│   │   ├── Toolbar/         # Editing tool controls
│   │   └── Modals/          # Dialog components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   │   ├── imageProcessing/ # Image manipulation functions
│   │   └── fileHandling/    # File I/O operations
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # Application constants
│   └── assets/              # Static assets
├── public/                  # Public assets
├── tests/                   # Test files
└── docs/                    # Documentation
```

## Common Development Commands

### Setup and Installation
```bash
npm install                 # Install dependencies
npm run dev                 # Start development server
npm run build              # Build for production
npm run preview            # Preview production build
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript type checking
npm run format             # Format code with Prettier
```

### Testing
```bash
npm run test               # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
```

## Image Processing Architecture

### Core Components
1. **ImageCanvas** - Main canvas component for displaying and editing images
2. **ToolManager** - Manages active editing tools and their states
3. **FilterEngine** - Applies image filters and effects
4. **LayerManager** - Handles multi-layer image composition
5. **HistoryManager** - Implements undo/redo functionality

### Image Workflow
1. **Import**: Handle file uploads, format validation, and initial processing
2. **Display**: Render image on canvas with proper scaling and positioning
3. **Edit**: Apply transformations, filters, and adjustments in real-time
4. **Export**: Process final image with selected quality and format settings

### Performance Considerations
- Use **Web Workers** for heavy image processing operations
- Implement **image caching** to avoid redundant processing
- Utilize **requestAnimationFrame** for smooth animations
- Consider **canvas offscreen rendering** for complex operations
- Implement **progressive loading** for large images

## File Format Support

### Input Formats
- JPEG, PNG, GIF, WebP, BMP, TIFF
- HEIC/HEIF (with conversion library)
- SVG (for vector graphics import)

### Output Formats
- JPEG (with quality control)
- PNG (with transparency support)
- WebP (modern format recommendation)
- PDF (for document export)

## UI/UX Guidelines

### Editor Interface
- **Main Canvas**: Central editing area with zoom and pan controls
- **Toolbar**: Context-sensitive tool selection and options
- **Layers Panel**: Manage multiple image layers
- **Properties Panel**: Adjustment controls for selected tools
- **History Panel**: Visual undo/redo timeline

### Responsive Design
- Mobile-friendly touch controls
- Adaptive toolbar layouts
- Gesture support for common operations
- Progressive disclosure of advanced features

## Development Best Practices

### Image Handling
- Always validate image files before processing
- Implement proper error handling for corrupt files
- Use appropriate memory management for large images
- Provide user feedback during processing operations

### State Management
- Use **Zustand** or **Redux Toolkit** for complex state
- Keep image processing state separate from UI state
- Implement proper state persistence for sessions

### Accessibility
- Provide keyboard shortcuts for all major functions
- Ensure proper ARIA labels for interactive elements
- Implement high contrast mode support
- Consider screen reader compatibility for image descriptions

## Testing Strategy

### Unit Tests
- Image processing utility functions
- Component rendering and behavior
- File format conversion logic

### Integration Tests
- Complete image editing workflows
- File upload/download processes
- Cross-browser compatibility

### Visual Regression Tests
- Canvas rendering consistency
- Filter and effect outputs
- UI component appearance

## Future Enhancement Areas

### Advanced Features
- AI-powered image enhancement
- Batch processing capabilities
- Cloud storage integration
- Collaboration features
- Advanced color management

### Performance Optimizations
- WebGL acceleration for filters
- SIMD processing for large operations
- Streaming image processing
- Progressive image loading