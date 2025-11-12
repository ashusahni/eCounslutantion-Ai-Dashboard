def get_dashboard_html() -> str:
    """Return the complete HTML for the dashboard"""
    import os
    from pathlib import Path
    
    # Get the path to the frontend directory
    frontend_dir = Path(__file__).parent.parent / "frontend"
    index_file = frontend_dir / "index.html"
    
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        # Fallback to a simple HTML if frontend files don't exist
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>eConsultation AI Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; text-align: center; }
                .error { color: #e74c3c; text-align: center; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>eConsultation AI Dashboard</h1>
                <div class="error">
                    Frontend files not found. Please ensure the frontend directory exists with index.html, CSS, and JS files.
                </div>
            </div>
        </body>
        </html>
        '''
