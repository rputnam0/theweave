<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3 Boxes Layout</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">

    <!-- 
      Main Container 
      - max-w-2xl: Restricts width so it doesn't stretch too wide on huge screens
      - w-full: Ensures it takes up available space up to the max-width
    -->
    <div class="w-full max-w-2xl">
        
        <!-- 
          Grid Layout 
          - grid-cols-2: Creates two equal columns
          - gap-4: Adds the spacing between columns and rows
        -->
        <div class="grid grid-cols-2 gap-4">
            
            <!-- Box 1 -->
            <div class="h-48 bg-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg hover:bg-blue-600 transition-colors cursor-pointer">
                Box 1
            </div>

            <!-- Box 2 -->
            <div class="h-48 bg-teal-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg hover:bg-teal-600 transition-colors cursor-pointer">
                Box 2
            </div>

            <!-- 
              Box 3 (Large Box)
              - col-span-2: Spans across both columns, ensuring it equals Width(Box1) + Width(Gap) + Width(Box2)
            -->
            <div class="col-span-2 h-64 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-2xl hover:bg-indigo-700 transition-colors cursor-pointer">
                Box 3 (Full Width)
            </div>

        </div>

    </div>

</body>
</html>