import React from 'react';

class CustomErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('LexicalEditor error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="editor-error-boundary">
                    <h3>Something went wrong with the editor.</h3>
                    <details>
                        <summary>Error Details</summary>
                        <p>{this.state.error && this.state.error.toString()}</p>
                        <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default CustomErrorBoundary;
