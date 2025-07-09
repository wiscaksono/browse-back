import { ClipLoader } from 'react-spinners';

interface ILoadingSpinnerProps {
  size?: number;
}

export const LoadingSpinner = ({ size }: ILoadingSpinnerProps) => (
  <div className={'flex min-h-screen items-center justify-center bg-slate-50'}>
    <ClipLoader size={size ?? 100} color={'#3E3E3E'} />
  </div>
);
