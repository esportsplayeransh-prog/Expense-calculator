import java.util.Scanner;

public class expenseCalculator{
    static class Expense {
        String description;
        double amount;
        String category;

    // Constructor: Naya expense banane ke liye
        public  Expense(String description, double amount, String category) {
            this.description = description;
            this.amount = amount;
            this.category = category;
    }

    // Data ko print karne ka stylish tareeka
        public void display() {
            System.out.println(description + " | " + amount + " | " + category);
        }
    }
    public static void main(String[] args) {
        // Array of Objects: Yahan Array aur Objects ka depth mil raha hai
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter the number of days of expense you want to calculate: ");
        int size = sc.nextInt(); // Maano user ne 30 dala
        sc.nextLine(); // Consume newline

        Expense[] list = new Expense[size];
        double total=0;
        for (int i = 0; i < size; i++) {
            System.out.println("Expense of day " + (i + 1) + " details :");
            System.out.print("Description: ");
            String desc = sc.nextLine();
            System.out.print("Amount: ");
            double amt = sc.nextDouble();
            sc.nextLine(); // Buffer clear karne ke liy
            System.out.print("Category: ");
            String cat = sc.nextLine();
            // Naya object banakar array mein store karna
            list[i] = new Expense(desc, amt, cat);
            System.out.println("Done! enter next or exit.\n");
            total+=amt;
        }
        // Loop chalakar display karna
        for (Expense e : list) {
            if (e != null) e.display();
        }
       double avg=total/size;
        System.out.println("total amount you spend in "+ size + " days: "+ total);
        System.out.println("On an average you spend around "+ avg + " daily");
        System.out.print("enter category to search total expenses: ");
        String searchCat=sc.nextLine();
        double catTotal=0;
        for(int i=0;i<size;i++){
            if (list[i].category.equalsIgnoreCase(searchCat)) catTotal+=list[i].amount;
        }
        System.out.println("\nYour total amount in " + searchCat + " is: " + catTotal);
    }
}