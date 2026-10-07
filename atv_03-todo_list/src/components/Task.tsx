export interface TaskProps {
  id: number;
  description: string;
  checked: boolean;
  onCheck?: (id: number) => void;
}

export function Task( {id, description, checked, onCheck} : TaskProps ) {
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onCheck?.(id);
  }

  return (
    <div
      className="flex items-center gap-2"
    > 
      <input type="checkbox" checked={checked} onChange={handleChange}/>
      <p className="text-[16px] pb-1">
        {description}
      </p>
    </div>
  );
}