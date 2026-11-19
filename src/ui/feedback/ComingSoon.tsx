import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

export interface ComingSoonProps {
    title: string;
    description: string;
    showHomeButton?: boolean;
}

const ComingSoon = ({ title, description, showHomeButton = true }: ComingSoonProps) => {
    return (
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-4 text-center">
                <div className="w-20 h-20 bg-slate-800/50 text-accent rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-slate-700/50">
                    <Clock size={40} />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
                <p className="text-slate-400 mb-8">
                    {description}
                </p>
                {showHomeButton && (
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-slate-900 rounded-full font-bold hover:bg-accent transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Home
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ComingSoon;
