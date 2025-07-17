import React, { Suspense } from "react";

const ReactQuill = React.lazy(() => import("react-quill"));
import "react-quill/dist/quill.snow.css";

const QuillNoSSRWrapper = (props: React.ComponentProps<typeof ReactQuill>) => {
  return (
    <Suspense fallback={<div>Đang tải trình soạn thảo...</div>}>
      <ReactQuill {...props} />
    </Suspense>
  );
};

export default QuillNoSSRWrapper;
